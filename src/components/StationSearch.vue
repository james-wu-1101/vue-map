<template>
  <div class="search-container">
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜尋站點名稱..."
        class="search-input"
      />
      <i class="fas fa-search search-icon"></i>
    </div>
    
    <!-- 搜索結果列表 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div 
        v-for="station in searchResults" 
        :key="station.sno"
        class="search-result-item"
        @click="handleStationSelect(station)"
      >
        <div class="station-name">{{ station.sna }}</div>
        <div class="station-info">
          <span class="bike-count">
            <i class="fas fa-bicycle"></i> {{ station.available_rent_bikes }}/{{ station.total }}
          </span>
          <span class="station-area">{{ station.sarea }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { YouBikeStation } from '../services/youbikeApi'

const props = defineProps<{
  stations: YouBikeStation[]
  showSearch: boolean
}>()

const emit = defineEmits<{
  (e: 'select', station: YouBikeStation): void
  (e: 'close'): void
}>()

const searchQuery = ref('')

// 搜索結果
const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return props.stations.filter(station => 
    station.sna.toLowerCase().includes(query) ||
    station.ar.toLowerCase().includes(query) ||
    station.sarea.toLowerCase().includes(query)
  )
})

// 處理搜索
const handleSearch = () => {
  // 搜索邏輯已通過 computed 屬性實現
}

// 處理站點選擇
const handleStationSelect = (station: YouBikeStation) => {
  emit('select', station)
  emit('close')
}
</script>

<style scoped>
.search-container {
  position: absolute;
  top: 20px;
  right: 15%;
  z-index: 1000;
  width: 300px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 15px;
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  outline: none;
  background-color: #fff;
  color: #000;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-results {
  margin-top: 5px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.search-result-item:last-child {
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
}

.bike-count {
  color: #2c3e50;
}

.bike-count i {
  margin-right: 4px;
}

.station-area {
  background-color: #e8f5e9;
  padding: 2px 6px;
  border-radius: 3px;
  color: #2e7d32;
}
</style> 