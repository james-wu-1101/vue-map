<script setup lang="ts">
import { ref } from 'vue'
import MapComponent from './components/MapComponent.vue'
import StationSearch from './components/StationSearch.vue'
import NearbyStations from './components/NearbyStations.vue'
import UsageChart from './components/UsageChart.vue'
import { useStationStore } from './stores/stationStore'
import type { YouBikeStation } from './services/youbikeApi'

const stationStore = useStationStore()
const userLocation = ref<[number, number] | null>(null)
const showSearch = ref(false)
const showNearby = ref(false)
const mapRef = ref<InstanceType<typeof MapComponent> | null>(null)

const handleStationSelect = (station: YouBikeStation) => {
  // 調用 MapComponent 的 moveToStation 方法
  if (mapRef.value) {
    mapRef.value.moveToStation(station)
  }
}
</script>

<template>
  <div class="app">
    <div class="content">
      <div class="map-section">
        <MapComponent 
          ref="mapRef"
          @close-search="showSearch = false"
          @close-nearby="showNearby = false"
        />
        <StationSearch
          :stations="stationStore.stations"
          :show-search="showSearch"
          @select="handleStationSelect"
          @close="showSearch = false"
        />
        <NearbyStations
          :stations="stationStore.stations"
          :user-location="userLocation"
          :show-nearby="showNearby"
          @select="handleStationSelect"
          @close="showNearby = false"
        />
      </div>
      <div class="chart-section">
        <UsageChart />
      </div>
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  width: 100%;
}

.app {
  width: 100%;
  background: #f5f5f5;
  padding: 20px 0;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.map-section {
  width: 100%;
  height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-section {
  width: 100%;
  min-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 全局樣式重置 */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app {
    padding: 10px 0;
  }
  
  .content {
    padding: 0 10px;
  }
  
  .map-section {
    height: 400px;
  }
  
  .chart-section {
    min-height: 400px;
  }
}
</style>
