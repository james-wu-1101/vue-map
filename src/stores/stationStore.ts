import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchYouBikeStations } from '../services/youbikeApi'
import type { YouBikeStation } from '../services/youbikeApi'

export const useStationStore = defineStore('station', () => {
  const stations = ref<YouBikeStation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 獲取站點數據
  const fetchStations = async () => {
    if (stations.value.length > 0) return // 如果已經有數據就不重新獲取
    
    loading.value = true
    error.value = null
    
    try {
      const data = await fetchYouBikeStations()
      stations.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '獲取站點數據失敗'
      console.error('Error loading YouBike stations:', e)
    } finally {
      loading.value = false
    }
  }

  // 更新站點數據
  const updateStations = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await fetchYouBikeStations()
      stations.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新站點數據失敗'
      console.error('Error updating YouBike stations:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    stations,
    loading,
    error,
    fetchStations,
    updateStations
  }
}) 