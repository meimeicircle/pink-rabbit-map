
export enum RabbitVerdict {
  RECOMMEND = '推薦',
  NOT_RECOMMENDED = '不建議',
  NEUTRAL = '無感', // Represents empty/blank
}

export interface EstateProject {
  id: string;
  name: string; // 建案名稱
  lat: number; // 緯度
  lng: number; // 經度
  address: string; // 地址
  region: string; // 區域
  developer: string; // 建商
  totalUnits: string; // 戶數 (原本就在，現在要顯著顯示)
  mainSquareFootage: string; // 主坪數
  priceInfo: string; // 價格資訊 (顯示用)
  
  // New Enhanced Fields for Drawer View
  score?: number; // 新增：粉粉兔跑分 (0-100)
  priceRange?: string; // 總價範圍 (e.g. 4,402~16,404萬)
  unitPrice?: string; // 單價範圍 (e.g. 127.4~160.6萬)
  soldStatus?: string; // 銷售狀況 (e.g. 已售 57/180戶)
  images?: string[]; // 圖片網址列表
  tags?: string[]; // 標籤 (e.g. 捷運宅, 公園景觀)
  
  verdict: RabbitVerdict | string; // 粉粉兔評論語
  reason: string; // 粉粉兔理由
  shortComment: string; // 粉粉兔簡評
  showOnMap: boolean; // 地圖上顯示 (Y/N)
  
  sellingPoint?: string; // 建案訴求 (主要訴求)
  materialTags?: string; // 建材emoji標籤

  // --- Pro Specs (Based on Competitor Analysis) ---
  baseArea?: string; // 基地坪數
  floorCount?: string; // 樓層規劃 (e.g. 24F/B5)
  floorHeight?: string; // 樓高文字 (e.g. 3.2m) - 舊欄位保留相容
  floorHeightMeters?: string; // 新增：樓高數值欄位 (e.g. 3.4)
  publicRatio?: string; // 公設比 (e.g. 33%)
  constructionType?: string; // 結構 (RC/SC/SRC) - 雖然UI不顯示了，但保留欄位
  zoning?: string; // 土地分區 (住二, 商四)
  parkingInfo?: string; // 車位規劃 (平面131, 機械0)
  completionDate?: string; // 預計完工
  facilities?: string; // 公設項目
  
  // --- New Fields (2024 Update) ---
  managementFee?: string; // 管理費
  trafficTags?: string; // 交通標籤
  featureMaterialTags?: string; // 建材標籤 (特色文字版)
  viewTags?: string; // 景觀標籤
  waterproofTags?: string; // 防水標籤
  featureFloorTags?: string; // 樓高標籤 (特色文字版)

  // --- Detailed Material Specs (From User PDF) ---
  windowSpecs?: string; // 窗戶 (品牌 + 玻璃) - 雖然UI改顯示廚具，但資料結構保留
  windowBrand?: string; // 新增：窗戶品牌
  glassType?: string; // 新增：玻璃規格
  kitchenSpecs?: string; // 新增：廚具設備
  kitchenBrand?: string; // 新增：廚具品牌
  bathroomSpecs?: string; // 衛浴 (品牌 + 硬體)
  bathroomBrands?: string; // 新增：衛浴品牌
  flooring?: string; // 新增：地板建材
  waterSystem?: string; // 新增：淨水系統

  nearestMRT?: {
    name: string;
    lineColor: string; // hex color
    distance?: string; // e.g. "350m"
  };

  // 🐰 網友投稿資訊
  submitter?: {
    name: string;
    emoji: string;
    email?: string;
  };
}

export interface FilterState {
  region: string;
  search: string;
  selectedMaterials: string[]; 
  // Advanced Numeric Filters
  publicRatioMax: string; // 公設比上限
  totalUnitsMin: string;  // 戶數下限
  totalUnitsMax: string;  // 戶數上限
  baseAreaMin: string;    // 基地面積下限
  baseAreaMax: string;    // 基地面積上限
  managementFeeMax: string; // 新增：管理費上限
  floorHeightMin: string;   // 新增：樓高下限
}

export interface MRTStation {
  name: string;
  lat: number;
  lng: number;
  lineColor: string; // CSS hex color
  lineName: string;
}
