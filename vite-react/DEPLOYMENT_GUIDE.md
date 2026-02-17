# 🚀 部署指南

## ⚠️ 重要提示

由於 GitHub 權限限制，分支已在本地建立完成，但需要手動推送至遠端。

## 📝 手動推送步驟

### 1. 確認當前分支
```bash
git branch
# 應該顯示 * rebuild/from-fixed
```

### 2. 推送分支到遠端
```bash
git push -u origin rebuild/from-fixed
```

### 3. 建立 Pull Request

前往 GitHub 網頁介面：
https://github.com/ShihKaiLin/vite-react/pulls

或使用 gh CLI：
```bash
gh pr create --base main --head rebuild/from-fixed \
  --title "全新 Vite + React 專案結構" \
  --body "詳見 DEPLOYMENT_GUIDE.md"
```

## 📦 專案結構

```
vite-react/
  src/
    App.jsx                 # 路由配置
    main.jsx               # 應用入口
    index.css              # Tailwind 樣式
    pages/
      HomePage.jsx         # 首頁（物件列表）
      PropertyDetail.jsx   # 物件詳情頁
    components/
      PropertyCard.jsx          # 物件卡片
      PropertyFormModal.jsx     # 新增/編輯表單
      AdminPanel.jsx            # 管理面板
      BulkSharePanel.jsx        # 批量操作
      LoginModal.jsx            # 登入彈窗
    lib/
      constants.js         # 常數定義
      firebase.js          # Firebase 整合
      gemini.js            # Gemini API 呼叫
  public/
  index.html
  package.json
  vite.config.js          # Vite 配置（含 @ alias）
  tailwind.config.js      # Tailwind 配置
  .env.example            # 環境變數範例
```

## 🔧 本地開發

### 1. 安裝依賴
```bash
pnpm install
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 填入實際值
```

### 3. 啟動開發伺服器
```bash
pnpm dev
```

### 4. 建置生產版本
```bash
pnpm build
```

## ✅ 驗收標準檢查清單

- [x] `pnpm install` 成功
- [x] `pnpm run build` 成功
- [x] 專案結構符合規範
- [x] 路由配置正確 (/ 和 /property/:id)
- [x] Tailwind CSS 配置正常
- [x] Vite alias (@) 配置正確
- [ ] 首頁能顯示物件列表與篩選（需 Firebase 配置）
- [ ] 管理員登入正常（需設定 VITE_ADMIN_PASS）
- [ ] 新增物件成功（需 Firebase Storage）
- [ ] 編輯物件成功（需 Firebase Firestore）
- [ ] 上下架切換正常（需 Firebase Firestore）
- [ ] 點卡片會導到 /property/:id
- [ ] 詳情頁可顯示資料（需 Firebase Firestore）
- [ ] Vercel build 不報錯

## 🔐 環境變數說明

### 必要變數
- `VITE_ADMIN_PASS`: 管理員密碼（預設 8888）
- `VITE_FUNCTIONS_BASE_URL`: Cloud Function 基礎 URL

### Firebase 配置（選填）
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📚 技術棧

- **框架**: Vite 6.x + React 18.3
- **路由**: React Router DOM 7.x
- **樣式**: Tailwind CSS 3.x
- **後端**: Firebase 11.x (Firestore + Storage)
- **地圖**: Leaflet + React Leaflet
- **圖示**: Lucide React
- **AI**: Gemini (via Cloud Function)

## 🎯 功能特色

### 前台功能
- 物件列表展示（支援篩選）
- 物件詳情頁
- 響應式設計
- 價格格式化（億/萬）
- 瀏覽次數統計

### 後台功能（管理員）
- 密碼登入
- 新增物件（含圖片上傳）
- 編輯物件（保留舊圖 + 追加新圖）
- 上下架切換
- 批量選取
- AI 生成文案（FB/LINE/Threads）
- 統計面板

## 🔄 Git 分支策略

- `main`: 生產環境
- `rebuild/from-fixed`: 全新架構（當前分支）

## 📞 聯絡資訊

如有問題請聯絡專案負責人。
