<template>
  <div class="nearby-container" v-if="showNearby">
    <div class="nearby-header">
      <h3>附近站點 ({{ nearbyStations.length }})</h3>
      <button class="close-btn" @click="closeNearby">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="nearby-list">
      <div 
        v-for="station in nearbyStations" 
        :key="station.sno"
        class="nearby-item"
        @click="handleStationSelect(station)"
      >
        <div class="station-name">{{ station.sna }}</div>
        <div class="station-info">
          <span class="bike-count">
            <i class="fas fa-bicycle"></i> {{ station.available_rent_bikes }}/{{ station.total }}
          </span>
          <span class="distance">{{ formatDistance(station.distance) }}</span>
        </div>
        <div class="station-address">{{ station.ar }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { YouBikeStation } from '../services/youbikeApi'

interface StationWithDistance extends YouBikeStation {
  distance: number
}

const props = defineProps<{
  stations: YouBikeStation[]
  userLocation: [number, number] | null
  showNearby: boolean
}>()

const emit = defineEmits<{
  (e: 'select', station: YouBikeStation): void
  (e: 'close'): void
}>()

// 計算附近站點
const nearbyStations = computed(() => {
  if (!props.userLocation) return []
  
  const [userLat, userLng] = props.userLocation
  const stationsWithDistance = props.stations.map(station => ({
    ...station,
    distance: calculateDistance(
      userLat,
      userLng,
      station.latitude,
      station.longitude
    )
  }))

  return stationsWithDistance
    .filter(station => station.distance <= 3) // 3公里內
    .sort((a, b) => a.distance - b.distance)
})

// 計算兩點之間的距離（公里）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // 地球半徑（公里）
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 角度轉弧度
const toRad = (value: number): number => {
  return value * Math.PI / 180
}

// 格式化距離顯示
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return Math.round(distance * 1000) + 'm'
  }
  return distance.toFixed(1) + 'km'
}

// 處理站點選擇
const handleStationSelect = (station: YouBikeStation) => {
  emit('select', station)
  emit('close')
}

// 關閉附近站點列表
const closeNearby = () => {
  emit('close')
}
</script>

<style scoped>
.nearby-container {
  position: fixed;
  top: 20px;
  left: 20px;
  bottom: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.nearby-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nearby-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  font-size: 1.1rem;
}

.close-btn:hover {
  color: #333;
}

.nearby-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.nearby-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nearby-item:hover {
  background-color: #f5f5f5;
}

.nearby-item:last-child {
  border-bottom: none;
}

.station-name {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.station-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.bike-count {
  color: #2c3e50;
}

.bike-count i {
  margin-right: 4px;
}

.distance {
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
}

.station-address {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 