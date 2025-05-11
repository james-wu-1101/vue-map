<template>
  <div class="map-container">
    <div id="map"></div>
    <div v-if="loading" class="loading">載入中...</div>
    <button class="location-btn" @click="getUserLocation" title="顯示附近站點">
      <i class="fas fa-location-arrow"></i>
    </button>
    <NearbyStations
      :stations="stationStore.stations"
      :user-location="userLocation"
      :show-nearby="showNearby"
      @select="moveToStation"
      @close="showNearby = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import '@fortawesome/fontawesome-free/css/all.css'
import type { YouBikeStation } from '../services/youbikeApi'
import NearbyStations from './NearbyStations.vue'
import { useStationStore } from '../stores/stationStore'

let map: L.Map | null = null
let markerCluster: any = null
let userMarker: L.Marker | null = null
const stationStore = useStationStore()
const loading = ref(true)
const markers = ref<Map<string, L.Marker>>(new Map())
const userLocation = ref<[number, number] | null>(null)
const showNearby = ref(false)
const showSearch = ref(false)

const emit = defineEmits<{
  (e: 'close-search'): void
  (e: 'close-nearby'): void
}>()

// 移動到選中的站點
const moveToStation = (station: YouBikeStation) => {
  if (!map || !markers.value.has(station.sno)) return

  const marker = markers.value.get(station.sno)
  if (!marker) return

  // 展開群聚
  if (markerCluster && map) {
    const bounds = marker.getLatLng()
    markerCluster.zoomToShowLayer(marker, () => {
      if (map) {
        map.setView(bounds, 18)
        // 打開彈窗
        marker.openPopup()
      }
    })
  }

  // 關閉搜索和附近站點列表
  showSearch.value = false
  showNearby.value = false
  emit('close-search')
  emit('close-nearby')
}

// 暴露 moveToStation 方法給父組件
defineExpose({
  moveToStation
})

// 創建自定義圖標
const createCustomIcon = (available: number, total: number) => {
  const ratio = available / total
  let color = '#ff0000' // 紅色（無車）
  if (ratio > 0.5) {
    color = '#00ff00' // 綠色（車多）
  } else if (ratio > 0) {
    color = '#ffff00' // 黃色（車少）
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="' +
          'background-color: ' + color + ';' +
          'width: 32px;' +
          'height: 32px;' +
          'border-radius: 50%;' +
          'display: flex;' +
          'align-items: center;' +
          'justify-content: center;' +
          'border: 2px solid white;' +
          'box-shadow: 0 0 4px rgba(0,0,0,0.5);' +
          '">' +
          '<i class="fas fa-bicycle" style="color: white; font-size: 16px;"></i>' +
          '</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// 創建彈出視窗內容
const createPopupContent = (station: YouBikeStation) => {
  return '<div class="station-popup">' +
         '<h3>' + station.sna + '</h3>' +
         '<p>可借車數：' + station.available_rent_bikes + '</p>' +
         '<p>總停車格：' + station.total + '</p>' +
         '<p>地址：' + station.ar + '</p>' +
         '<p>更新時間：' + new Date(station.updateTime).toLocaleString() + '</p>' +
         '</div>'
}

// 獲取用戶位置
const getUserLocation = () => {
  if (!navigator.geolocation) {
    alert('您的瀏覽器不支持地理定位功能')
    return
  }

  loading.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      userLocation.value = [latitude, longitude]
      showNearby.value = true
      
      // 更新用戶位置標記
      if (userMarker) {
        userMarker.setLatLng([latitude, longitude])
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-icon',
          html: '<div style="' +
                'background-color: #4285F4;' +
                'width: 24px;' +
                'height: 24px;' +
                'border-radius: 50%;' +
                'border: 3px solid white;' +
                'box-shadow: 0 0 4px rgba(0,0,0,0.5);' +
                '"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
        
        userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map!)
      }
      
      // 移動地圖到用戶位置
      map?.setView([latitude, longitude], 15)
      loading.value = false
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('無法獲取您的位置，請確保已允許位置權限')
      loading.value = false
    }
  )
}

onMounted(async () => {
  // 初始化地圖
  map = L.map('map', {
    center: [25.0330, 121.5654],
    zoom: 17,
    zoomControl: true,
    // 添加地圖選項以提高精度
    preferCanvas: true,
    attributionControl: true,
    // 設置坐標系統
    crs: L.CRS.EPSG3857
  })

  // 添加 OpenStreetMap 圖層
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    // 添加圖層選項以提高精度
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 2
  }).addTo(map)

  // 初始化群聚群組
  markerCluster = (L as any).markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  })

  try {
    // 獲取 YouBike 站點數據
    await stationStore.fetchStations()
    
    // 為每個站點創建標記
    stationStore.stations.forEach(station => {
      // 確保坐標是數字類型
      const lat = parseFloat(station.latitude)
      const lng = parseFloat(station.longitude)
      
      // 檢查坐標是否有效
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(`Invalid coordinates for station ${station.sna}: lat=${lat}, lng=${lng}`)
        return
      }

      const marker = L.marker(
        [lat, lng],
        { 
          icon: createCustomIcon(station.available_rent_bikes, station.total),
          // 添加標記選項以提高精度
          riseOnHover: true,
          autoPan: true
        }
      )
      
      marker.bindPopup(createPopupContent(station))
      markerCluster?.addLayer(marker)
      markers.value.set(station.sno, marker)
    })

    // 將群聚群組添加到地圖
    map.addLayer(markerCluster)

    // 設置地圖的縮放限制
    map.setMaxBounds([
      [21.9, 120.5],  // 西南角
      [25.3, 122.0]   // 東北角
    ])
    map.setMinZoom(10)
    map.setMaxZoom(19)
  } catch (error) {
    console.error('Error loading YouBike stations:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  markerCluster = null
  markers.value.clear()
  userMarker = null
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  z-index: 1000;
}

:global(.station-popup) {
  font-family: Arial, sans-serif;
}

:global(.station-popup h3) {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

:global(.station-popup p) {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

:global(.custom-div-icon) {
  background: none;
  border: none;
}

:global(.custom-div-icon i) {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.location-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4285F4;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.location-btn:hover {
  background-color: #f5f5f5;
}

:global(.user-location-icon) {
  background: none;
  border: none;
}
</style> 