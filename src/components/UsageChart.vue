<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>YouBike 每月使用次數統計</h3>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import userCountData from '../services/userCount.json'

// 註冊必要的組件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent
])

const currentType = ref('line')

// 處理數據
const processedData = computed(() => {
  const times = userCountData.map(item => item.time)
  const counts = userCountData.map(item => item['使用次數'])
  
  // 計算移動平均（用於折線圖）
  const movingAverage = counts.map((_, index) => {
    const start = Math.max(0, index - 2)
    const end = index + 1
    const slice = counts.slice(start, end)
    return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length)
  })

  return {
    times,
    counts,
    movingAverage
  }
})

// 圖表配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const time = params[0].name
      const count = params[0].value.toLocaleString()
      const avg = params[1]?.value.toLocaleString() || ''
      return '時間：' + time + '<br/>使用次數：' + count + (avg ? '<br/>移動平均：' + avg : '')
    }
  },
  toolbox: {
    feature: {
      saveAsImage: {
        title: '保存圖片',
        pixelRatio: 2,
        backgroundColor: '#fff',
        iconStyle: {
          borderColor: '#666',
          color: '#666'
        }
      },
      restore: {
        title: '還原',
        iconStyle: {
          borderColor: '#666',
          color: '#666'
        }
      },
      dataView: {
        show: true,
        title: '數據視圖',
        readOnly: true,
        lang: ['數據視圖', '關閉', '刷新'],
        buttonColor: '#666',
        buttonTextColor: '#fff',
        iconStyle: {
          borderColor: '#666',
          color: '#666'
        }
      },
      magicType: {
        type: ['line', 'bar', 'stack'],
        title: {
          line: '折線圖',
          bar: '柱狀圖',
          stack: '堆疊圖'
        },
        iconStyle: {
          borderColor: '#666',
          color: '#666'
        }
      }
    },
    right: 20,
    top: 20,
    itemSize: 18,
    itemGap: 12,
    iconStyle: {
      borderColor: '#666',
      color: '#666'
    },
    emphasis: {
      iconStyle: {
        borderColor: '#333',
        color: '#333'
      }
    }
  },
  dataZoom: [
    {
      type: 'slider',
      show: true,
      start: 0,
      end: 100
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: processedData.value.times,
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '使用次數',
    axisLabel: {
      formatter: (value: number) => (value / 10000).toFixed(0) + '萬'
    }
  },
  legend: {
    data: ['使用次數', '移動平均'],
    top: 10,
    left: 'center'
  },
  series: [
    {
      name: '使用次數',
      type: currentType.value,
      data: processedData.value.counts,
      itemStyle: {
        color: '#4285F4'
      },
      emphasis: {
        itemStyle: {
          color: '#2c3e50'
        }
      }
    },
    {
      name: '移動平均',
      type: 'line',
      data: processedData.value.movingAverage,
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#FF9800',
        width: 2,
        type: 'dashed'
      },
      itemStyle: {
        color: '#FF9800'
      }
    }
  ]
}))
</script>

<style scoped>
.chart-container {
  padding: 20px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-shrink: 0;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.type-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn:hover {
  background: #f5f5f5;
}

.type-btn.active {
  background: #4285F4;
  color: white;
  border-color: #4285F4;
}

.chart {
  flex: 1;
  min-height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    min-height: 400px;
  }

  .chart-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .chart {
    min-height: 300px;
  }
}
</style> 