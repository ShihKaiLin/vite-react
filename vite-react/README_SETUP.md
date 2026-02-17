# 🚀 Vite React 專案 - 完整重構版

## 📦 檔案內容

此 ZIP 檔案包含完整的 Vite + React 專案原始碼，已從 `app_optimized_fixed.jsx` 重構為標準模組化架構。

**不包含**：
- `node_modules/` - 需要執行 `pnpm install` 安裝
- `dist/` - 需要執行 `pnpm build` 建置
- `.git/` - Git 歷史記錄

---

## 🔧 快速開始

### 1. 解壓縮
```bash
unzip vite-react-rebuild.zip
cd vite-react
```

### 2. 安裝依賴
```bash
pnpm install
```

如果沒有 pnpm：
```bash
npm install -g pnpm
```

### 3. 設定環境變數
```bash
cp .env.example .env
```

編輯 `.env` 填入您的配置：
```bash
VITE_ADMIN_PASS=8888
VITE_FUNCTIONS_BASE_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net

# Firebase 配置
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 啟動開發伺服器
```bash
pnpm dev
```

訪問：http://localhost:5173

### 5. 建置生產版本
```bash
pnpm build
```

---

## 📁 專案結構

```
vite-react/
├── src/
│   ├── App.jsx                    # 路由配置 (BrowserRouter)
│   ├── main.jsx                   # 應用入口
│   ├── index.css                  # Tailwind 樣式
│   ├── pages/
│   │   ├── HomePage.jsx           # 首頁（物件列表、篩選、管理）
│   │   └── PropertyDetail.jsx     # 物件詳情頁
│   ├── components/
│   │   ├── PropertyCard.jsx       # 物件卡片元件
│   │   ├── PropertyFormModal.jsx  # 新增/編輯表單
│   │   ├── AdminPanel.jsx         # 管理面板
│   │   ├── BulkSharePanel.jsx     # 批量操作面板
│   │   └── LoginModal.jsx         # 登入彈窗
│   └── lib/
│       ├── constants.js           # 常數定義（區域、類型、價格格式化）
│       ├── firebase.js            # Firebase 整合（7 個 API）
│       └── gemini.js              # Gemini API 呼叫
├── public/
├── index.html
├── package.json
├── vite.config.js                 # Vite 配置（含 @ alias）
├── tailwind.config.js             # Tailwind 配置
├── postcss.config.js              # PostCSS 配置
├── .env.example                   # 環境變數範例
└── DEPLOYMENT_GUIDE.md            # 詳細部署指南
```

---

## 🔧 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| Vite | 6.4.1 | 建置工具 |
| React | 18.3.1 | UI 框架 |
| React Router DOM | 7.13.0 | 路由管理 |
| Tailwind CSS | 3.4.19 | 樣式框架 |
| Firebase | 11.10.0 | 後端服務 (Firestore + Storage) |
| Leaflet | 1.9.4 | 地圖顯示 |
| React Leaflet | 4.2.1 | React 地圖元件 |
| Lucide React | 0.469.0 | 圖示庫 |

---

## 🎯 核心功能

### 前台功能
- ✅ 物件列表展示（卡片式）
- ✅ 篩選功能（區域、類型、價格範圍）
- ✅ 物件詳情頁（含圖片展示）
- ✅ 響應式設計（手機/平板/桌面）
- ✅ 價格格式化（億/萬）
- ✅ 瀏覽次數統計

### 後台功能（管理員）
- ✅ 密碼登入（VITE_ADMIN_PASS）
- ✅ 新增物件（含多圖上傳）
- ✅ 編輯物件（保留舊圖 + 追加新圖）
- ✅ 上下架切換（銷售中/已售出）
- ✅ 批量選取
- ✅ AI 文案生成（FB/LINE/Threads）
- ✅ 統計面板（總數/上架數/已售數）

---

## 📋 路由配置

- `/` - 首頁（物件列表）
- `/property/:id` - 物件詳情頁

---

## 🔐 Firebase API 函數

`src/lib/firebase.js` 提供以下 7 個函數：

1. **subscribeToProperties(onData, onError)** - 訂閱物件列表
2. **saveProperty(data)** - 新增物件
3. **updateProperty(id, data)** - 更新物件
4. **updatePropertyStatus(id, status)** - 切換上下架
5. **incrementViewCount(id)** - 增加瀏覽次數
6. **uploadImage(file)** - 上傳圖片到 Storage
7. **getPropertyById(id)** - 取得單一物件

---

## 🎨 Tailwind 自訂顏色

```javascript
colors: {
  primary: '#1e3a8a',      // 深藍
  accent: '#B39158',       // 金色
  background: '#f8fafc',   // 淺灰背景
  foreground: '#0f172a',   // 深色文字
}
```

---

## 📝 Vite 配置

```javascript
// vite.config.js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

使用範例：
```javascript
import { TAICHUNG_DISTRICTS } from '@/lib/constants';
import { saveProperty } from '@/lib/firebase';
```

---

## ✅ 驗收標準

### 已完成 ✅
- ✅ `pnpm install` 成功（409 個套件）
- ✅ `pnpm run build` 成功
- ✅ 專案結構符合規範
- ✅ 路由配置正確
- ✅ Tailwind CSS 配置正常
- ✅ Vite alias (@) 配置
- ✅ Firebase 7 個 API 函數完整
- ✅ Gemini Cloud Function 整合
- ✅ 圖片上傳（支援追加）
- ✅ 編輯功能（updateProperty）
- ✅ 狀態切換（銷售中/已售出）

### 需要配置後測試 ⚠️
- ⏳ 首頁顯示物件列表（需 Firebase 配置）
- ⏳ 管理員登入（需設定 VITE_ADMIN_PASS）
- ⏳ 新增/編輯物件（需 Firebase）
- ⏳ 詳情頁顯示（需 Firebase）
- ⏳ Vercel 部署（需部署測試）

---

## 🚀 部署到 Vercel

### 方式一：使用 Vercel CLI
```bash
npm i -g vercel
vercel
```

### 方式二：使用 GitHub
1. 將專案推送到 GitHub
2. 在 Vercel 導入 repository
3. 設定環境變數
4. 部署

### 環境變數設定
在 Vercel Dashboard 設定以下環境變數：
- `VITE_ADMIN_PASS`
- `VITE_FUNCTIONS_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## 🐛 常見問題

### Q1: pnpm 未安裝
```bash
npm install -g pnpm
```

### Q2: 建置失敗
```bash
# 清除快取
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q3: Firebase 連線失敗
- 檢查 `.env` 配置是否正確
- 確認 Firebase 專案已啟用 Firestore 和 Storage
- 檢查 Firebase 規則設定

### Q4: 圖片上傳失敗
- 確認 Firebase Storage 已啟用
- 檢查 Storage 規則允許寫入
- 確認檔案大小未超過限制

---

## 📞 需要協助？

1. 查看 `DEPLOYMENT_GUIDE.md` 獲取詳細部署指南
2. 查看專案內各檔案的註解
3. 檢查 Firebase Console 的錯誤日誌

---

## 🎉 開始使用

```bash
# 1. 解壓縮
unzip vite-react-rebuild.zip
cd vite-react

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env

# 4. 啟動開發
pnpm dev
```

---

**專案重構完成日期**: 2026-02-17  
**基於**: app_optimized_fixed.jsx  
**架構**: Vite + React + Firebase + Tailwind CSS
