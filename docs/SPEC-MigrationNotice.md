# MizukiPrism 網域遷移公告 Popup 規格書

> 本規格書為 [SPEC.md](./SPEC.md) 的擴充模組。為 prism.mizuki.tw 合併回 prism.oshi.tw/mizuki 的過渡期,向粉絲顯示一次性遷移公告。

## 1. Intent

### 1.1 Purpose

在自動重導向(預計 7/1)生效前,提前告知粉絲網站即將遷移,降低重導向開始時的困惑。公告以 popup 形式顯示,粉絲確認後不再打擾。

### 1.2 Users

| 角色 | 影響 |
|------|------|
| 粉絲(Fan) | 首次造訪看到遷移公告,點「知道了」後不再顯示 |
| 策展人(Curator) | 不受影響(admin 系統獨立部署) |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 公告觸及 | 所有頁面(含 `/aurora`)首次造訪皆顯示 |
| 打擾最小化 | 確認一次後永久靜音(localStorage 記錄) |
| 既有功能 | 既有 E2E 測試與 UI 行為不受影響 |

### 1.4 Non-goals

- **非通用公告系統**:不做 data-driven 公告管線(本站 7/1 後重導向,無未來需求)
- **非自動重導向**:本規格只涵蓋公告,不實作重導向本身
- **非跨裝置同步**:dismissal 記錄僅存於單一瀏覽器的 localStorage

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| 遷移公告 Popup | 首次造訪任一頁面時顯示公告對話框 | 粉絲 |
| 確認靜音 | 點「知道了」寫入 localStorage,之後不再顯示 | 粉絲 |

### 2.2 公告文字

```
本網站 (prism.mizuki.tw) 即將合併回 prism.oshi.tw/mizuki 以便於進行管理。
預計將於 7/1 開始進行自動重導向到 https://prism.oshi.tw/mizuki 。
```

- 日期為 **7/1**(原需求文字 6/31 為無效日期,已確認修正)
- `https://prism.oshi.tw/mizuki` 顯示為可點擊連結,`target="_blank"` + `rel="noopener noreferrer"`

## 3. Behavior

### 3.1 顯示邏輯

| 情境 | 行為 |
|------|------|
| 首次造訪(無 dismissal 記錄) | 顯示 popup |
| 已點過「知道了」 | 不顯示 |
| localStorage 讀取失敗(隱私模式等) | 視為未讀,照常顯示 |
| SSR / 首次 render | 回傳 `null`(`mounted` guard,避免 hydration mismatch) |

### 3.2 關閉邏輯

| 操作 | 行為 |
|------|------|
| 點「知道了」 | 寫入 localStorage → 關閉 popup |
| 點 backdrop | 無作用(重要公告,避免誤觸略過) |
| 寫入 localStorage 失敗 | popup 本次仍關閉,下次造訪自然再顯示 |

「知道了」為唯一關閉途徑,無 X 按鈕。

### 3.3 Storage 格式

| 項目 | 值 |
|------|-----|
| Key | `mizukiprism_migration_notice_dismissed` |
| Value | `'true'` |
| 位置 | `localStorage` |

## 4. Design

### 4.1 檔案異動

| 檔案 | 動作 | 內容 |
|------|------|------|
| `app/lib/migrationNoticeStorage.ts` | 新增 | key 常數、`readMigrationNoticeDismissed()`、`writeMigrationNoticeDismissed()`,仿 `catalogViewStorage.ts`(可注入 storage、try/catch、寫入回傳 boolean) |
| `app/components/MigrationNoticeModal.tsx` | 新增 | `'use client'`、`createPortal`、毛玻璃風格仿 `CreatePlaylistDialog.tsx`、`role="dialog"` + `aria-modal` + `aria-labelledby` |
| `app/layout.tsx` | 修改 | 掛載 `<MigrationNoticeModal />`(全站生效) |
| `playwright.config.ts` | 修改 | `use.storageState` 預填 dismissed flag,保護既有 spec |
| `tests/migration-notice.spec.ts` | 新增 | 公告行為 E2E 測試 |

### 4.2 視覺層級

`z-[150]`:高於 NowPlayingModal(`z-[100]`),低於 Toast(`z-[200]`)與錯誤橫幅(`z-[300]`)。

### 4.3 文字存放

公告文字寫死在元件內,不進 `data/*.json`(一次性公告,生命週期至 7/1)。

## 5. Testing

### 5.1 E2E(`tests/migration-notice.spec.ts`)

此 spec 覆寫 `storageState` 為空白,以測試首次造訪情境:

| 案例 | 驗證 |
|------|------|
| 首次造訪 | popup 顯示,文字正確 |
| 點「知道了」 | popup 關閉,localStorage 寫入 `'true'` |
| 重新整理 | popup 不再顯示 |
| 連結 | 指向 `https://prism.oshi.tw/mizuki`,`target="_blank"` |

### 5.2 既有測試保護

`playwright.config.ts` 的 `use.storageState` 預填 `mizukiprism_migration_notice_dismissed: 'true'`(origin: `http://localhost:3000`),既有 14 個 spec 檔不受 popup backdrop 影響、無需逐一修改。
