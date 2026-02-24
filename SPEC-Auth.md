# MizukiPrism 播放清單匯出/匯入與認證佔位規格書

> 本規格書為 [SPEC.md](./SPEC.md) 的擴充模組。取代原有的 Email OTP + Cloudflare Workers 雲端同步方案，改為以 JSON 檔案匯出/匯入實現播放清單可攜性，並保留認證 UI 佔位供未來擴充。

## 1. Intent

### 1.1 Purpose

為 MizukiPrism 粉絲提供播放清單的可攜性（Portability）。粉絲可將播放清單匯出為 JSON 檔案進行備份，或透過檔案分享將播放清單轉移至其他裝置。認證頁面保留為「即將推出」佔位，供未來實作認證功能時使用。

### 1.2 Users

| 角色 | 影響 |
|------|------|
| 粉絲（Fan） | 可匯出/匯入播放清單 JSON 檔案，實現備份與跨裝置轉移 |
| 策展人（Curator） | 不受影響 |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 資料可攜性 | 粉絲可將播放清單匯出為標準 JSON 格式，任何裝置皆可匯入 |
| 跨裝置轉移 | 透過檔案分享（AirDrop、雲端硬碟、通訊軟體）即可轉移播放清單 |
| 資料安全 | 清除瀏覽器資料前可先匯出備份，避免資料遺失 |
| 架構簡化 | 移除 Cloudflare Workers 後端依賴，前端維持純靜態部署 |

### 1.4 Non-goals

- **非雲端同步**：不提供自動雲端同步功能
- **非認證系統**：不實作登入/註冊/Session 管理
- **非即時同步**：不在裝置間自動同步播放清單
- **非帳號管理**：不提供使用者帳號相關功能

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| 匯出全部（Export All） | 將所有播放清單匯出為單一 JSON 檔案 | 粉絲 |
| 匯出單一（Export Single） | 將指定播放清單匯出為 JSON 檔案 | 粉絲 |
| 匯入（Import） | 從 JSON 檔案匯入播放清單，含驗證與衝突處理 | 粉絲 |
| 認證頁面佔位（Auth Placeholder） | 顯示「即將推出」靜態頁面，保留 `/auth` 路徑 | 粉絲 |

### 2.2 User Journeys

#### Journey 1：備份播放清單

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想備份播放清單以防資料遺失 |
| 行動（Action） | 開啟播放清單面板 → 點擊「匯出全部」按鈕 |
| 結果（Outcome） | 瀏覽器下載包含所有播放清單的 JSON 檔案 |

#### Journey 2：轉移至新裝置

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想在新裝置上使用原有的播放清單 |
| 行動（Action） | 在舊裝置匯出 → 透過檔案分享傳送至新裝置 → 在新裝置開啟播放清單面板 → 點擊「匯入」→ 選擇 JSON 檔案 |
| 結果（Outcome） | 新裝置載入匯入的播放清單，與既有播放清單合併（相同 ID 保留較新版本，舊版本重新命名） |

#### Journey 3：匯入檔案

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲收到他人分享的播放清單 JSON 檔案 |
| 行動（Action） | 開啟播放清單面板 → 點擊「匯入」→ 選擇 JSON 檔案 |
| 結果（Outcome） | 系統驗證檔案格式，匯入有效的播放清單，顯示匯入結果摘要 |

#### Journey 4：造訪認證頁面

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲點擊登入連結或直接造訪 `/auth` |
| 行動（Action） | 頁面顯示「即將推出」佔位卡片 |
| 結果（Outcome） | 粉絲了解認證功能尚未開放，可點擊連結返回首頁 |

## 3. Behavior

### 3.1 Feature Behaviors

#### 3.1.1 匯出（Export）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有播放清單 | 點擊「匯出全部」 | 瀏覽器下載 JSON 檔案，檔名為 `mizukiprism-playlists-YYYY-MM-DD.json` |
| 有播放清單 | 點擊單一播放清單的下載圖示 | 瀏覽器下載 JSON 檔案，檔名為 `mizukiprism-{playlist-name}-YYYY-MM-DD.json` |
| 無播放清單 | 點擊「匯出全部」 | 按鈕為禁用狀態，無法點擊 |

**匯出格式（Export Envelope）：**

```json
{
  "version": 1,
  "exportedAt": "2026-02-24T12:00:00.000Z",
  "source": "MizukiPrism",
  "playlists": [
    {
      "id": "playlist-1234567890-abc123def",
      "name": "我的最愛",
      "versions": [
        {
          "performanceId": "perf-001",
          "songTitle": "Song Title",
          "originalArtist": "Artist",
          "videoId": "dQw4w9WgXcQ",
          "timestamp": 120,
          "endTimestamp": 360
        }
      ],
      "createdAt": 1708761600000,
      "updatedAt": 1708761600000
    }
  ]
}
```

#### 3.1.2 匯入（Import）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 點擊「匯入」並選擇有效 JSON 檔案 | 驗證通過後匯入播放清單，顯示 Toast「已匯入 N 個播放清單」 |
| 任意 | 選擇非 JSON 檔案或無效格式 | 顯示 Toast 錯誤「無法匯入：檔案格式無效」 |
| 任意 | 選擇 JSON 但 `source` 不是 `MizukiPrism` | 顯示 Toast 錯誤「無法匯入：非 MizukiPrism 匯出檔案」 |
| 任意 | 選擇 JSON 但 `version` 不支援 | 顯示 Toast 錯誤「無法匯入：檔案版本不支援」 |

**匯入驗證步驟：**

1. 解析 JSON：失敗則顯示「檔案格式無效」
2. 檢查 `source === "MizukiPrism"`：失敗則顯示「非 MizukiPrism 匯出檔案」
3. 檢查 `version === 1`：失敗則顯示「檔案版本不支援」
4. 檢查 `playlists` 為非空陣列：失敗則顯示「檔案不含播放清單」
5. 逐一驗證每個播放清單的必要欄位（`id`、`name`、`versions`、`createdAt`、`updatedAt`）

**衝突處理（ID 相同時）：**

- 若匯入的播放清單 ID 與本機既有播放清單 ID 相同：
  - 比較 `updatedAt`，保留較新者
  - 較舊者的 ID 重新生成，名稱加上「（匯入）」後綴，作為獨立播放清單保留

#### 3.1.3 認證頁面佔位（Auth Placeholder）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 造訪 `/auth` | 顯示「即將推出」靜態卡片，包含返回首頁連結 |

### 3.2 Error Scenarios

| 功能範圍 | 錯誤情境 | 系統行為 |
|----------|----------|----------|
| 匯入 | JSON 解析失敗 | Toast 顯示「無法匯入：檔案格式無效」 |
| 匯入 | `source` 欄位不符 | Toast 顯示「無法匯入：非 MizukiPrism 匯出檔案」 |
| 匯入 | `version` 欄位不支援 | Toast 顯示「無法匯入：檔案版本不支援」 |
| 匯入 | `playlists` 為空 | Toast 顯示「無法匯入：檔案不含播放清單」 |
| 匯入 | localStorage 空間不足 | Toast 顯示「本機儲存空間不足」 |
| 匯出 | 無播放清單 | 「匯出全部」按鈕禁用 |

### 3.3 UI Placement

| 位置 | 元素 | 說明 |
|------|------|------|
| PlaylistPanel 標頭 | 「匯出全部」按鈕 | 匯出所有播放清單（播放清單列表視圖時顯示） |
| PlaylistPanel 標頭 | 「匯入」按鈕 | 觸發檔案選擇器匯入播放清單（播放清單列表視圖時顯示） |
| 各播放清單卡片 | 下載圖示 | 匯出單一播放清單（hover 時顯示，與現有的編輯、播放、刪除圖示並列） |

## 4. Refinement

### 4.1 TypeScript Interface

```typescript
interface PlaylistExportEnvelope {
  version: 1;
  exportedAt: string;    // ISO 8601
  source: 'MizukiPrism';
  playlists: Playlist[]; // 使用現有 Playlist 型別
}
```

### 4.2 Filename Conventions

| 匯出類型 | 檔名模式 | 範例 |
|----------|----------|------|
| 全部匯出 | `mizukiprism-playlists-YYYY-MM-DD.json` | `mizukiprism-playlists-2026-02-24.json` |
| 單一匯出 | `mizukiprism-{name}-YYYY-MM-DD.json` | `mizukiprism-我的最愛-2026-02-24.json` |

### 4.3 Terminology

以下術語為本規格書新增或重新定義，補充 SPEC.md §4.1 之術語表。

| 術語 | 英文 | 定義 |
|------|------|------|
| 匯出信封 | Export Envelope | 匯出檔案的 JSON 外層結構，包含 `version`、`exportedAt`、`source`、`playlists` 四個欄位。`version` 用於未來向後相容。 |
| 匯入驗證 | Import Validation | 匯入時的五步驟驗證流程：JSON 解析 → source 檢查 → version 檢查 → playlists 非空 → 欄位完整性。 |
| 衝突處理 | Conflict Resolution | 匯入時 ID 重複的處理策略：保留較新者，較舊者重新生成 ID 並加上「（匯入）」後綴。 |
| 認證佔位 | Auth Placeholder | `/auth` 路徑的「即將推出」靜態頁面，不含任何認證功能。 |

### 4.4 File Changes

#### 刪除

| 檔案 / 目錄 | 理由 |
|-------------|------|
| `workers/` | 移除 Cloudflare Workers 後端（OTP + 雲端同步），不再需要 |
| `app/components/MergePlaylistDialog.tsx` | 移除雲端合併對話框，不再需要 |

#### 修改

| 檔案 | 變更內容 |
|------|----------|
| `app/contexts/FanAuthContext.tsx` | 改為 stub：永遠回傳未登入狀態，移除所有 API 呼叫 |
| `app/contexts/PlaylistContext.tsx` | 移除雲端同步邏輯，新增 `exportAll`、`exportSingle`、`importPlaylists` 方法 |
| `app/components/PlaylistPanel.tsx` | 標頭新增匯出/匯入按鈕，播放清單卡片新增單一匯出圖示 |
| `app/components/PlayerWrapper.tsx` | 簡化 Provider 層級，移除 auth 依賴與合併對話框 |
| `app/auth/page.tsx` | 改為「即將推出」佔位頁面 |
| `app/page.tsx` | 移除登入/登出 UI，簡化使用者足跡區塊 |
