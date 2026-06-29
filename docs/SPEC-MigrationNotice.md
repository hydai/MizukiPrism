# MizukiPrism 網域遷移公告 Popup 規格書

> 本規格書為 [SPEC.md](./SPEC.md) 的擴充模組。為 prism.mizuki.tw 合併回 prism.oshi.tw/mizuki 的過渡期,向粉絲顯示遷移公告並執行重導向。
>
> **修訂(2026-06-29)**:過渡時程逼近,公告由「一次性靜音」升級為「確認即導向」。確認後寫入 localStorage,之後造訪本站自動重導向至新站。導向行為僅在正式網域 `prism.mizuki.tw` 生效。

## 1. Intent

### 1.1 Purpose

在 prism.mizuki.tw 正式合併回 prism.oshi.tw/mizuki 的過渡期,引導粉絲前往新站:首次造訪顯示公告,粉絲點「前往新站」即導向;之後再次造訪自動導向。降低過渡期的迷路與困惑。

### 1.2 Users

| 角色 | 影響 |
|------|------|
| 粉絲(Fan) | 首次造訪看到遷移公告,點「前往新站」前往新站;之後造訪自動導向 |
| 策展人(Curator) | 不受影響(admin 系統獨立部署) |
| 開發者(Dev) | 不受影響(localhost / preview 不觸發公告與導向) |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 公告觸及 | 正式網域所有頁面(含 `/aurora`)首次造訪皆顯示 |
| 導向效率 | 確認一次後,後續造訪本站自動導向新站(localStorage 記錄) |
| 開發/測試安全 | localhost / preview 一律靜默,不彈窗、不導向;既有 E2E 不受影響 |

### 1.4 Non-goals

- **非通用公告系統**:不做 data-driven 公告管線(本站過渡後即退役,無未來需求)
- **非無條件硬導向**:不做「不論是否確認、到期日一到全體強制導向」;導向以使用者確認(或先前已確認)為前提
- **非跨裝置同步**:dismissal 記錄僅存於單一瀏覽器的 localStorage
- **非路徑映射**:一律導向固定 URL `https://prism.oshi.tw/mizuki`,不嘗試把本站深層連結對應到新站

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| 遷移公告 Popup | 正式網域首次造訪時顯示公告對話框 | 粉絲 |
| 確認即導向 | 點「前往新站」寫入 localStorage 並 `location.replace` 導向新站 | 粉絲 |
| 回訪自動導向 | 已確認者再次造訪本站,不顯示公告,直接導向新站 | 粉絲 |
| 環境限定 | 僅 `prism.mizuki.tw` 生效;其他網域靜默 | 開發者 |

### 2.2 公告文字

```
本網站 (prism.mizuki.tw) 即將合併回 prism.oshi.tw/mizuki 以便於進行管理。
點擊下方「前往新站」即可前往;之後再次造訪本站將自動為您重導向。
```

- 第一段的 `prism.oshi.tw/mizuki` 顯示為可點擊連結,`target="_blank"` + `rel="noopener noreferrer"`(讓使用者可先在新分頁預覽)
- 確認按鈕文字為 **「前往新站」**
- 導向目標固定為 `https://prism.oshi.tw/mizuki`

## 3. Behavior

### 3.1 啟用與顯示邏輯

| 情境 | 行為 |
|------|------|
| 非 `prism.mizuki.tw` 網域(localhost / preview 等) | **inactive**:回傳 `null`,不彈窗、不導向 |
| 正式網域 + 無 dismissal 記錄 | 顯示 popup |
| 正式網域 + 已有 dismissal 記錄 | 不顯示 popup,直接 `location.replace` 導向新站 |
| localStorage 讀取失敗(隱私模式等) | 視為未讀;在正式網域則顯示 popup |
| SSR / 首次 render | 回傳 `null`(`mounted` guard,避免 hydration mismatch) |

### 3.2 確認與導向邏輯

| 操作 | 行為 |
|------|------|
| 點「前往新站」 | 寫入 localStorage → `window.location.replace('https://prism.oshi.tw/mizuki')` |
| 點 backdrop | 無作用(重要公告,避免誤觸略過) |
| 寫入 localStorage 失敗 | 仍照常導向(導向為主要目的;下次造訪因無記錄會再顯示公告) |

- 採 `location.replace()`(非 `href`):不在瀏覽器歷史留下本站,避免使用者在新站按「上一頁」回到本站後又被自動導走的迴圈。
- 「前往新站」為唯一確認途徑,無 X 按鈕。

### 3.3 決策函式(純函式,可單元測試)

將「該做什麼」抽成不依賴 DOM 的純函式:

```
resolveMigrationNoticeAction({ hostname, dismissed }) → 'inactive' | 'show' | 'redirect'
```

| 條件 | 回傳 |
|------|------|
| `hostname !== MIGRATION_ACTIVE_HOST` | `'inactive'` |
| `dismissed === true` | `'redirect'` |
| 其他 | `'show'` |

常數:`MIGRATION_ACTIVE_HOST = 'prism.mizuki.tw'`、`NEW_SITE_URL = 'https://prism.oshi.tw/mizuki'`。

### 3.4 Storage 格式

| 項目 | 值 |
|------|-----|
| Key | `mizukiprism_migration_notice_dismissed` |
| Value | `'true'` |
| 位置 | `localStorage` |

語意由「已關閉、靜音」調整為「已確認、之後自動導向」。Key/Value 不變,沿用既有 helper。

## 4. Design

### 4.1 檔案異動

| 檔案 | 動作 | 內容 |
|------|------|------|
| `app/lib/migrationNoticeStorage.ts` | 既有 | key 常數與 `read/writeMigrationNoticeDismissed()` 沿用,不變 |
| `app/lib/migrationNotice.ts` | 新增 | `MIGRATION_ACTIVE_HOST`、`NEW_SITE_URL`、`resolveMigrationNoticeAction()` 純函式 |
| `app/components/MigrationNoticeModal.tsx` | 修改 | `useEffect` 依決策函式選擇 inactive/show/redirect;`handleAcknowledge` 改為寫旗標 + `location.replace`;更新文字與按鈕 |
| `playwright.config.ts` | 修改 | 移除預填 dismissed flag(localhost 已 inactive,毋須再保護);保留其餘設定 |
| `tests/migration-notice.spec.ts` | 修改 | 改為驗證「localhost 下靜默(無 popup、不導向)」的 dev 安全防線 |
| `tests/migration-notice.ts` | 新增 | `resolveMigrationNoticeAction()` 三分支單元測試 |
| `package.json` | 修改 | `lint` 清單加入新測試檔、新增 `test:migration-notice` script |

### 4.2 視覺層級

`z-[150]`:高於 NowPlayingModal(`z-[100]`),低於 Toast(`z-[200]`)與錯誤橫幅(`z-[300]`)。維持不變。

### 4.3 文字存放

公告文字寫死在元件內,不進 `data/*.json`(過渡期一次性公告)。

## 5. Testing

### 5.1 單元測試(`tests/migration-notice.ts`,以 tsx 執行)

涵蓋決策函式三分支:

| 案例 | 輸入 | 期望 |
|------|------|------|
| 非正式網域 | `hostname='localhost'` | `'inactive'`(不論 dismissed) |
| 正式網域、未確認 | `hostname='prism.mizuki.tw', dismissed=false` | `'show'` |
| 正式網域、已確認 | `hostname='prism.mizuki.tw', dismissed=true` | `'redirect'` |

storage helper 既有單元測試(`tests/migration-notice-storage.ts`)不受影響。

### 5.2 E2E(`tests/migration-notice.spec.ts`)

因導向限定正式網域,Playwright 在 localhost 執行時模組為 inactive。此 spec 改為驗證 dev 安全防線:

| 案例 | 驗證 |
|------|------|
| localhost 首次造訪 | 無 `migration-notice-dialog`、頁面正常可用(搜尋框可見) |
| localhost 已有 dismissed flag | 不發生導向,仍停留在本站、頁面正常可用 |

### 5.3 既有測試保護

導向限定 `prism.mizuki.tw`,localhost 一律 inactive,故既有 14 個 spec 檔不再需要 `playwright.config.ts` 預填 flag 即可正常執行。
