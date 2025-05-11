export interface YouBikeStation {
  sno: string;          // 站點代號
  sna: string;          // 站點名稱
  total: number;          // 總停車格
  available_rent_bikes: number;          // 可借車數
  available_return_bikes: number;          // 可還車數
  sarea: string;        // 行政區
  ar: string;          // 地址
  latitude: number;         // 緯度
  longitude: number;         // 經度
  updateTime: string;        // 資料更新時間
}

export async function fetchYouBikeStations(): Promise<YouBikeStation[]> {
  try {
    const response = await fetch('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouBike stations:', error);
    return [];
  }
} 