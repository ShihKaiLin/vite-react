// 聯絡資訊
export const CONTACT_INFO = {
  name: "林世塏",
  phone: "0912-345-678",
  line: "rocklinrealestate",
  company: "國美館宅生活",
};

// 台中行政區
export const DISTRICT_HIERARCHY = [
  "中區", "東區", "南區", "西區", "北區",
  "西屯區", "南屯區", "北屯區",
  "豐原區", "大里區", "太平區", "清水區",
  "沙鹿區", "大甲區", "東勢區", "梧棲區",
  "烏日區", "神岡區", "大肚區", "大雅區",
  "后里區", "霧峰區", "潭子區", "龍井區",
  "外埔區", "和平區", "石岡區", "大安區", "新社區"
];

// 物件類型
export const PROPERTY_TYPES = [
  "大樓",
  "公寓",
  "透天",
  "別墅",
  "華廈",
  "套房",
];

// 價格正規化：萬 -> 萬
export function normalizePrice(price) {
  const num = Number(price);
  return Number.isFinite(num) ? num : 0;
}

// 價格格式化：萬 -> { yi, wan }
export function formatPrice(priceInWan) {
  const wan = priceInWan || 0;
  const yi = Math.floor(wan / 10000);
  const remainWan = wan % 10000;
  return { yi, wan: remainWan };
}
