# MizukiLens 規格書

## 1. Intent

### 1.1 Purpose

MizukiLens 是 MizukiPrism 的上游資料收集管線工具，透過第三方 scraping 技術自動抓取 YouTube 歌回直播的存檔列表，並從留言區與影片描述欄擷取歌曲時間軸，產出符合 MizukiPrism Data Contract 的 JSON 資料，經策展人審核後匯入 MizukiPrism。

### 1.2 Users

| 角色 | 描述 | 核心任務 |
|------|------|----------|
| 策展人（Curator） | MizukiPrism 的資料維護者，使用 MizukiLens 半自動收集歌曲資料 | 觸發抓取、審核解析結果、修正錯誤資料、匯出至 MizukiPrism |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 資料登錄效率 | 一場歌回直播的歌曲資料登錄時間從手動 15–30 分鐘縮短至 2–5 分鐘（含審核） |
| 資料覆蓋率 | 自動辨識 ≥80% 的歌曲時間軸（留言區有人整理的場次） |
| 減少人為錯誤 | 時間戳格式統一化、自動驗證，避免手動輸入的格式不一致與誤植 |
| 增量維護成本 | 新增一場直播的資料收集可在單次 CLI 操作中完成，無需切換多個工具 |

### 1.4 Success Criteria

- [ ] 可從指定 YouTube 頻道抓取所有歷史直播存檔列表
- [ ] 支援增量抓取（全量比對、最近 N 場、指定日期範圍）
- [ ] 自動從留言區擷取歌曲時間軸（優先）
- [ ] 留言區無時間軸時，自動從影片描述欄擷取 chapters 作為備案
- [ ] 兩者皆無時，標記該場次為待處理
- [ ] 策展人可透過 TUI 審核、編輯、確認解析結果
- [ ] 產出符合 MizukiPrism Data Contract 的 JSON 檔案
- [ ] 提供 CLI 指令將確認後的 JSON 匯入 MizukiPrism
- [ ] 本地快取已處理過的直播場次，避免重複抓取與解析
- [ ] 頻道 ID 可設定，支援未來擴展至其他歌勢

### 1.5 Non-goals

- **非前端應用**：MizukiLens 不提供任何 Web UI，前端瀏覽與播放由 MizukiPrism 負責
- **非全自動管線**：不支援無人值守的排程抓取（如 cron job），所有抓取由策展人手動觸發
- **非 YouTube API 依賴**：不使用 YouTube Data API v3，全程透過第三方 scraping 工具，無需 API key
- **非通用爬蟲**：僅針對 YouTube 直播存檔與留言結構設計，不支援其他平台
- **非影片下載器**：不下載任何影片內容，僅擷取後設資料與時間軸文字
- **非歌曲辨識系統**：不使用音訊指紋或 AI 辨識歌曲，依賴人工整理的時間軸留言

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| 頻道設定（Channel Config） | 設定目標 YouTube 頻道 ID 與相關參數，支援多頻道設定檔 | 策展人 |
| 直播列表抓取（Stream Discovery） | 從目標頻道抓取所有直播存檔的影片 ID、標題、日期，支援增量模式 | 策展人 |
| 時間軸擷取（Timestamp Extraction） | 從留言區與描述欄擷取歌曲時間軸，自動解析為結構化資料 | 策展人 |
| 審核介面（Review TUI） | TUI 互動介面，讓策展人逐場審核解析結果、編輯修正、標記狀態 | 策展人 |
| 資料匯出（Export） | 將審核通過的資料匯出為符合 MizukiPrism Data Contract 的 JSON | 策展人 |
| 資料匯入（Import） | CLI 指令將匯出的 JSON 匯入 MizukiPrism 資料庫 | 策展人 |
| 本地快取（Local Cache） | 記錄已抓取、已解析、已審核、已匯入的場次狀態，避免重複作業 | 策展人 |

### 2.2 User Journeys

#### Journey 1：首次全量抓取

| 階段 | 內容 |
|------|------|
| 情境（Context） | 策展人初次設定 MizukiLens，需要抓取頻道的所有歷史歌回直播 |
| 行動（Action） | 設定頻道 ID → 執行全量抓取 → 系統列出所有直播存檔 → 逐場擷取時間軸 → 進入 TUI 審核 |
| 結果（Outcome） | 所有場次的抓取與解析結果存入本地快取，策展人可分批審核並匯出 |

#### Journey 2：增量抓取新直播

| 階段 | 內容 |
|------|------|
| 情境（Context） | 歌勢完成了新的歌回直播，策展人需要將新場次加入 MizukiPrism |
| 行動（Action） | 執行增量抓取（最近 N 場）→ 系統自動過濾已處理場次 → 僅對新場次擷取時間軸 → TUI 審核 → 匯出 → 匯入 MizukiPrism |
| 結果（Outcome） | 新場次資料匯入 MizukiPrism，本地快取更新 |

#### Journey 3：處理無時間軸的場次

| 階段 | 內容 |
|------|------|
| 情境（Context） | 某場直播的留言區無人整理時間軸，描述欄也沒有 chapters |
| 行動（Action） | 系統標記該場次為「待處理」→ 策展人在 TUI 中看到標記 → 策展人可手動輸入時間軸或稍後再處理 |
| 結果（Outcome） | 待處理場次不會被匯出，直到策展人補齊資料並確認 |

#### Journey 4：修正解析錯誤

| 階段 | 內容 |
|------|------|
| 情境（Context） | 自動解析的時間軸有誤（歌名錯誤、時間戳偏移、遺漏歌曲） |
| 行動（Action） | 策展人在 TUI 審核介面中編輯歌名、修改時間戳、新增遺漏條目、刪除錯誤條目 |
| 結果（Outcome） | 修正後的資料標記為已審核，可安全匯出 |

#### Journey 5：重新擷取特定場次

| 階段 | 內容 |
|------|------|
| 情境（Context） | 某場直播的留言區事後才有人補上時間軸，策展人想重新擷取 |
| 行動（Action） | 在 TUI 中選擇該場次 → 觸發重新擷取 → 系統重新解析留言與描述欄 → 策展人審核新結果 |
| 結果（Outcome） | 該場次的解析結果更新，之前的「待處理」標記移除 |

## 3. Behavior

### 3.1 Feature Behaviors

#### 3.1.1 頻道設定（Channel Config）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 無設定檔 | 首次執行 | 進入互動式設定引導，要求輸入頻道 ID 或 URL；驗證後建立設定檔 |
| 設定檔存在 | 執行任何抓取指令 | 使用設定檔中的頻道 ID |
| 設定檔存在 | 執行 `config` 子指令 | 顯示目前設定，可修改頻道 ID、新增頻道、切換啟用頻道 |
| 輸入頻道 URL | 設定頻道 | 自動解析 URL 中的頻道 ID（支援 `youtube.com/channel/UC...`、`youtube.com/@handle`、`youtube.com/c/custom`） |
| 輸入無效 URL 或 ID | 設定頻道 | 顯示錯誤訊息「無法解析頻道 ID，請確認格式」 |

> **設定檔位置**：`~/.config/mizukilens/config.toml`

#### 3.1.2 直播列表抓取（Stream Discovery）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 執行 `fetch --all` | 抓取頻道所有直播存檔影片，與本地快取比對，標記新發現的場次 |
| 任意 | 執行 `fetch --recent N` | 抓取最近 N 場直播存檔，與本地快取比對 |
| 任意 | 執行 `fetch --after YYYY-MM-DD` | 抓取指定日期之後的直播存檔 |
| 任意 | 執行 `fetch --after YYYY-MM-DD --before YYYY-MM-DD` | 抓取指定日期範圍內的直播存檔 |
| 抓取進行中 | — | TUI 顯示進度條與已發現場次數量 |
| 抓取完成 | — | 顯示摘要：新發現 X 場、已存在 Y 場、總計 Z 場 |
| 網路錯誤 | 抓取中斷 | 已抓取的部分結果保存至快取，顯示錯誤訊息並建議稍後重試 |
| scrapetube 無法辨識內容類型 | — | 抓取所有影片後，以影片標題關鍵字（如「歌回」、「歌枠」、「唱歌」、「singing」）輔助篩選，無法判定者標記為「待確認」讓策展人決定 |
| 任意 | 執行 `fetch` 加上 `--force` | 忽略快取狀態，重新處理所有符合條件的場次（包含已標記為 `excluded` 或 `imported` 的場次）。已審核的解析結果不會被覆蓋，僅重新執行抓取與時間軸擷取步驟 |

> **抓取機制**：使用 `scrapetube.get_channel()` 搭配 `content_type="streams"` 過濾直播內容。若 `content_type` 過濾不可靠，退回 `content_type="videos"` 並結合標題關鍵字篩選。

#### 3.1.3 時間軸擷取（Timestamp Extraction）

擷取流程依優先順序執行三階段嘗試：

```
留言區搜尋 → 找到有效時間軸？
  ├→ 是：解析並儲存，標記來源為 "comment"
  └→ 否：描述欄搜尋 → 找到有效時間軸？
        ├→ 是：解析並儲存，標記來源為 "description"
        └→ 否：標記場次為「待處理」(pending)
```

##### 3.1.3.1 留言區時間軸擷取

| 狀態 | 操作 | 結果 |
|------|------|------|
| 場次未擷取 | 執行時間軸擷取 | 使用 `youtube-comment-downloader` 抓取留言，依熱門排序 |
| 留言抓取完成 | — | 掃描所有留言，識別包含 ≥3 個時間戳模式的留言為候選時間軸留言 |
| 找到多個候選留言 | — | 依以下權重排序選取最佳候選：(1) 置頂留言最優先 (2) 按讚數最多 (3) 時間戳數量最多 |
| 選定候選留言 | — | 解析每行的時間戳與歌曲資訊，產生結構化歌曲列表 |
| 留言區已關閉 | — | 跳過留言區，進入描述欄擷取 |

**時間戳解析規則**：

| 格式 | 範例 | 解析結果 |
|------|------|----------|
| `H:MM:SS` | `1:23:45` | 5025 秒 |
| `HH:MM:SS` | `01:23:45` | 5025 秒 |
| `MM:SS` | `23:45` | 1425 秒 |
| `M:SS` | `3:45` | 225 秒 |

**歌曲資訊解析規則**：

每行以時間戳開頭，後接分隔符號與歌曲資訊：

```
時間戳 [分隔符號] 歌曲資訊
```

| 分隔符號 | 範例 |
|----------|------|
| 空白 | `1:23:45 歌曲名` |
| `-` | `1:23:45 - 歌曲名` |
| `–` | `1:23:45 – 歌曲名` |
| `—` | `1:23:45 — 歌曲名` |

歌曲資訊中若包含 `/ ` 或 ` - ` 分隔的兩部分，嘗試拆解為歌名與原唱者（後半部分為原唱者）。例如：

| 原始文字 | 解析歌名 | 解析原唱者 |
|----------|----------|-----------|
| `打上花火 / DAOKO×米津玄師` | `打上花火` | `DAOKO×米津玄師` |
| `Lemon - 米津玄師` | `Lemon` | `米津玄師` |
| `打上花火` | `打上花火` | （空，待策展人補充） |

##### 3.1.3.2 描述欄時間軸擷取

| 狀態 | 操作 | 結果 |
|------|------|------|
| 留言區無有效時間軸 | — | 擷取影片描述欄文字 |
| 描述欄包含時間戳格式文字 | — | 以相同解析規則解析時間軸，標記來源為 "description" |
| 描述欄無時間戳 | — | 標記場次為「待處理」 |

> **描述欄擷取機制**：`scrapetube` 的回傳結果包含影片描述欄文字，無需額外 API 呼叫。若描述欄資訊不完整，使用 `yt-dlp --skip-download --print description` 補充。

##### 3.1.3.3 結束時間戳推算

版本（Version）的 `endTimestamp` 為選填欄位。自動推算規則：

| 情境 | 推算邏輯 |
|------|----------|
| 同場次中有下一首歌 | `endTimestamp` = 下一首歌的 `startTimestamp` |
| 該場次的最後一首歌 | `endTimestamp` 留空（MizukiPrism 播放至影片結束） |

策展人可在審核時手動覆寫 `endTimestamp`。

#### 3.1.4 審核介面（Review TUI）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有待審核場次 | 執行 `review` | 進入 TUI 審核模式，列出所有待審核場次 |
| TUI 場次列表 | 選擇場次 | 展開該場次的歌曲列表，顯示解析來源、時間戳、歌名、原唱者 |
| 歌曲列表 | 編輯歌名 | 就地編輯歌名文字 |
| 歌曲列表 | 編輯原唱者 | 就地編輯原唱者文字 |
| 歌曲列表 | 編輯時間戳 | 就地編輯開始/結束時間戳，格式驗證即時回饋 |
| 歌曲列表 | 新增歌曲 | 在指定位置插入新的歌曲條目 |
| 歌曲列表 | 刪除歌曲 | 刪除選中的歌曲條目（確認後） |
| 歌曲列表 | 新增演出備註 | 為歌曲版本附加備註文字（如「清唱版」） |
| 場次審核完成 | 確認（approve） | 場次狀態標記為「已審核」(approved)，可供匯出 |
| 場次有問題 | 跳過（skip） | 場次維持「待審核」狀態 |
| 場次不是歌回 | 排除（exclude） | 場次標記為「已排除」(excluded)，不會再出現在審核列表中 |
| 待處理場次 | 手動輸入時間軸 | 策展人逐筆輸入歌曲的時間戳與資訊 |
| 已審核場次 | 重新審核 | 可重新進入審核流程修改資料 |
| 任意 | 重新擷取（re-fetch） | 重新抓取留言與描述欄，覆蓋現有解析結果（確認後） |

**TUI 佈局**：

```
┌─────────────────────────────────────────────┐
│ MizukiLens - 審核模式                [?]幫助 │
├──────────────────┬──────────────────────────┤
│ 場次列表          │ 歌曲明細                 │
│                  │                          │
│ ● 2024-03-15     │ # | 時間    | 歌名 | 原唱 │
│   歌回 Vol.12    │ 1 | 0:03:20 | ...  | ... │
│ ○ 2024-03-08     │ 2 | 0:08:15 | ...  | ... │
│   歌回 Vol.11    │ 3 | 0:15:42 | ...  | ... │
│ ◌ 2024-03-01     │                          │
│   歌回 Vol.10    │                          │
│                  │                          │
├──────────────────┴──────────────────────────┤
│ [a]確認 [s]跳過 [x]排除 [e]編輯 [r]重新擷取 │
└─────────────────────────────────────────────┘
圖例：● 已審核  ○ 待審核  ◌ 待處理  ✕ 已排除
```

#### 3.1.5 資料匯出（Export）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有已審核場次 | 執行 `export` | 將所有已審核場次的資料匯出為 MizukiPrism Data Contract 格式的 JSON 檔案 |
| 有已審核場次 | 執行 `export --since YYYY-MM-DD` | 僅匯出指定日期之後審核通過的場次 |
| 有已審核場次 | 執行 `export --stream VIDEO_ID` | 僅匯出指定場次的資料 |
| 無已審核場次 | 執行 `export` | 顯示「無可匯出的資料，請先完成審核」 |
| 匯出完成 | — | 顯示匯出檔案路徑與摘要（場次數、歌曲數、版本數） |
| 匯出時發現歌名重複 | — | 自動合併為同一首歌曲，不同場次的演出為不同版本 |

**匯出格式**：產出單一 JSON 檔案，結構對齊 MizukiPrism 的 Data Contract（Song、Version、Stream 三實體）。詳見 §4.3。

#### 3.1.6 資料匯入（Import）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有匯出檔案 | 執行 `import FILE` | 讀取 JSON 檔案，與 MizukiPrism 現有資料比對 |
| 比對完成 | — | 顯示變更摘要：新增 X 首歌曲、新增 Y 個版本、新增 Z 場直播 |
| 策展人確認 | — | 將資料寫入 MizukiPrism 資料來源，本地快取標記為「已匯入」 |
| 發現衝突（同一場次已匯入） | — | 顯示衝突詳情，策展人選擇覆蓋或跳過 |
| JSON 格式錯誤 | — | 顯示驗證錯誤訊息，拒絕匯入 |

> **匯入機制**：MizukiPrism 目前使用靜態 JSON 檔案（`data/songs.json`、`data/streams.json`）。匯入時直接合併至這些檔案。

**匯入轉換映射**：

MizukiLens 匯出格式遵循 MizukiPrism SPEC.md 的邏輯 Data Contract。匯入時須轉換為 MizukiPrism 實際實作格式：

| 轉換項目 | MizukiLens 匯出 | MizukiPrism 實作 | 轉換規則 |
|----------|-----------------|------------------|----------|
| 歌曲名稱欄位 | `name` | `title` | 直接對應 |
| 原唱者欄位 | `artist` | `originalArtist` | 直接對應 |
| 時間戳格式 | `startTimestamp`（字串 `H:MM:SS`） | `timestamp`（數字，秒數） | 解析時間字串為秒數（如 `1:23:45` → `5025`） |
| 結束時間戳格式 | `endTimestamp`（字串） | `endTimestamp`（數字 \| null） | 同上；無值時轉為 `null` |
| 版本結構 | 獨立 `versions[]` 陣列 | 內嵌於 Song 的 `performances[]` | 依 `songId` 分組，嵌入對應歌曲 |
| 場次 ID | `id` = YouTube video ID | `id` = `"stream-{N}"`，另有 `videoId` 欄位 | 生成 MizukiPrism 風格 ID，YouTube video ID 寫入 `videoId` |
| Performance 欄位 | — | `date`、`streamTitle`、`videoId`（反正規化） | 從 Stream 實體複製 `date`、`title` 至每個 Performance |

**ID 生成規則**：匯入時為新增實體生成 MizukiPrism 風格的 ID：
- Stream: `"stream-{N}"`，N 為現有最大編號 + 1
- Song: `"song-{N}"`，N 為現有最大編號 + 1
- Performance: `"p{songIndex}-{performanceIndex}"`，依現有 MizukiPrism 慣例

#### 3.1.7 本地快取（Local Cache）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 執行 `status` | 顯示快取統計：各狀態場次數量 |
| 任意 | 執行 `status --detail` | 列出所有場次及其狀態 |
| 任意 | 執行 `cache clear` | 清除所有快取（確認後），下次執行為全新抓取 |
| 任意 | 執行 `cache clear --stream VIDEO_ID` | 清除指定場次的快取 |

**場次狀態流轉**：

```
discovered → extracted → approved → exported → imported
     │            │          │
     │            │          └→ (re-review) → approved
     │            └→ pending（無法自動解析）
     └→ excluded（不是歌回）
```

| 狀態 | 說明 |
|------|------|
| `discovered` | 已發現但尚未擷取時間軸 |
| `extracted` | 已自動擷取時間軸，待審核 |
| `pending` | 無法自動擷取時間軸，需人工介入 |
| `approved` | 策展人已審核通過 |
| `exported` | 已匯出為 JSON |
| `imported` | 已匯入 MizukiPrism |
| `excluded` | 策展人判定非歌回，永久排除 |

### 3.2 Error Scenarios

| 功能範圍 | 錯誤情境 | 系統行為 |
|----------|----------|----------|
| 直播列表抓取 | 網路連線失敗 | 顯示錯誤訊息，已抓取的部分結果保存至快取 |
| 直播列表抓取 | scrapetube 遭 YouTube 速率限制 | 顯示警告，建議等待後重試；已抓取結果保存 |
| 直播列表抓取 | 頻道 ID 無效或頻道不存在 | 顯示「無法存取該頻道，請確認頻道 ID」 |
| 直播列表抓取 | 頻道無任何直播存檔 | 顯示「該頻道無直播存檔」 |
| 時間軸擷取 | youtube-comment-downloader 抓取失敗 | 跳過留言區，嘗試描述欄；兩者皆失敗則標記為待處理 |
| 時間軸擷取 | 留言區已關閉 | 跳過留言區，嘗試描述欄 |
| 時間軸擷取 | 時間軸留言格式異常（無法解析） | 將原始留言文字保存供策展人參考，標記為待處理 |
| 時間軸擷取 | 時間戳超出合理範圍（如超過 12 小時） | 標記該時間戳為可疑，審核時高亮警示 |
| 資料匯出 | 磁碟空間不足 | 顯示「磁碟空間不足，無法寫入檔案」 |
| 資料匯入 | MizukiPrism 資料來源不可存取 | 顯示具體錯誤訊息（檔案不存在、權限不足等） |
| 資料匯入 | JSON schema 驗證失敗 | 列出所有驗證錯誤，拒絕匯入 |
| 本地快取 | 快取檔案損毀 | 顯示警告，提供重建快取的選項（重新全量抓取） |
| TUI | 終端機視窗過小 | 顯示最小尺寸提示（建議 80×24 以上） |

### 3.3 System Boundary

| 類型 | MizukiLens 控制 | MizukiLens 依賴（外部） |
|------|-----------------|-------------------------|
| 責任 | 直播列表抓取、時間軸解析、審核流程、資料匯出格式、本地快取管理 | 不負責前端展示、歌曲播放、播放清單管理（MizukiPrism 的責任） |
| 互動 | 輸出：MizukiPrism Data Contract 格式 JSON | 輸入：scrapetube（直播列表）、youtube-comment-downloader（留言）、yt-dlp（描述欄備案） |
| 控制 | 時間軸解析邏輯、候選留言選取演算法、審核狀態流轉、快取結構 | YouTube 網站結構穩定性、第三方 scraping 工具的維護狀態 |

### 3.4 Assumptions & Constraints

| 假設 | 說明 |
|------|------|
| 留言區時間軸格式 | 歌回直播的留言區通常會有粉絲整理的時間軸留言，格式為每行一個時間戳加歌名 |
| 第三方工具穩定性 | scrapetube 與 youtube-comment-downloader 依賴 YouTube 的非公開端點，YouTube 改版可能導致工具失效 |
| Python 環境 | 需要 Python 3.10+ 環境 |
| 終端機要求 | TUI 需要支援 Unicode 與 256 色的終端機模擬器，建議視窗大小 ≥ 80×24 |
| 單人操作 | 本地快取不處理多人同時操作的衝突 |
| 歌回辨識 | 系統無法自動判斷一場直播是否為歌回，依賴標題關鍵字篩選與策展人確認 |
| 磁碟空間 | 本地快取預估佔用空間：每場直播約 5–50 KB（後設資料 + 留言文字），1000 場約 50 MB |

## 4. Refinement

### 4.1 Terminology

| 術語 | 英文 | 定義 |
|------|------|------|
| 場次 | Stream | 一場完整的歌回直播，對應一個 YouTube 影片。與 MizukiPrism 的 Stream 實體對應。 |
| 時間軸 | Setlist / Timestamp List | 一場直播中所有歌曲的時間戳列表，通常由粉絲在留言區整理。 |
| 候選留言 | Candidate Comment | 留言區中被識別為可能包含歌曲時間軸的留言。判定標準為包含 ≥3 個時間戳模式。 |
| 時間戳模式 | Timestamp Pattern | 符合 `H:MM:SS`、`HH:MM:SS`、`MM:SS`、`M:SS` 格式的文字模式。 |
| 解析來源 | Source | 時間軸資料的擷取來源，可為 `comment`（留言區）或 `description`（描述欄）。 |
| 場次狀態 | Stream Status | 場次在 MizukiLens 工作流程中的階段，共 7 種狀態（見 §3.1.7）。 |
| 快取 | Cache | 本地儲存的場次後設資料、解析結果與審核狀態，以 SQLite 資料庫實作。 |
| 抓取模式 | Fetch Mode | 抓取直播列表的方式：全量（`--all`）、最近 N 場（`--recent N`）、日期範圍（`--after`/`--before`）。 |

### 4.2 Patterns

#### 4.2.1 資料流管線

```
YouTube ──scrapetube──→ Stream Discovery ──→ Local Cache (discovered)
                                                    │
YouTube ──yt-comment-downloader──→ Comment Extraction ──→ Timestamp Parsing ──→ Local Cache (extracted/pending)
YouTube ──scrapetube/yt-dlp──→ Description Extraction ──↗
                                                    │
                                              TUI Review ──→ Local Cache (approved)
                                                    │
                                              Export JSON ──→ Local Cache (exported)
                                                    │
                                          Import to MizukiPrism ──→ Local Cache (imported)
```

#### 4.2.2 時間軸候選留言選取演算法

```
1. 抓取影片留言（依熱門排序）
2. 過濾：保留包含 ≥3 個時間戳模式的留言
3. 若無候選 → 返回「無結果」
4. 若有候選 → 排序：
   a. 置頂留言（is_pinned）→ 最優先
   b. 按讚數（like_count）→ 降冪
   c. 時間戳數量 → 降冪
5. 取排名第一的留言為最佳候選
6. 解析該留言的每一行為 (timestamp, song_info) 對
```

#### 4.2.3 與 MizukiPrism 的資料對應

| MizukiLens 產出 | MizukiPrism 實體 | 對應關係 |
|-----------------|------------------|----------|
| 場次（YouTube URL + 日期 + 標題） | Stream | 1:1，以 YouTube URL 為唯一鍵 |
| 解析出的歌曲（歌名 + 原唱者） | Song | 以 name + artist 為唯一鍵，跨場次合併 |
| 歌曲在場次中的演出（時間戳 + 備註） | Version | songId + streamId 的交會點 |

#### 4.2.4 增量抓取與快取策略

| 抓取模式 | 行為 |
|----------|------|
| `--all` | 抓取頻道所有直播影片，與快取中的 video ID 比對，僅處理新發現的場次 |
| `--recent N` | 抓取最近 N 場直播影片，與快取比對 |
| `--after YYYY-MM-DD` | 抓取指定日期之後的影片 |
| `--after A --before B` | 抓取日期範圍 [A, B] 內的影片 |

所有模式均跳過快取中狀態為 `excluded` 或 `imported` 的場次（除非使用 `--force` 旗標）。

### 4.3 Data Contracts

#### 4.3.1 匯出 JSON 格式（MizukiPrism Data Contract）

匯出檔案為單一 JSON 檔案，頂層結構：

```json
{
  "version": "1.0",
  "exportedAt": "2024-03-15T12:00:00Z",
  "source": "mizukilens",
  "channelId": "UC...",
  "data": {
    "streams": [...],
    "songs": [...],
    "versions": [...]
  }
}
```

##### Stream

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | YouTube video ID（如 `C0ha06zw9wU`） |
| youtubeUrl | string | 是 | 正規化 URL（`https://www.youtube.com/watch?v={id}`） |
| date | string | 是 | 直播日期（ISO 8601 日期，如 `2024-03-15`） |
| title | string | 是 | 直播標題 |

##### Song

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 由 MizukiLens 生成的唯一 ID（格式：`mlens-song-{uuid-v4-short}`，取 UUID v4 前 8 碼） |
| name | string | 是 | 歌曲名稱 |
| artist | string | 是 | 原唱者名稱（解析不出時為空字串，策展人需在審核時補齊） |
| tags | string[] | 否 | 分類標籤，預設空陣列（由策展人在審核時或 MizukiPrism 中補充） |

**唯一性約束**：`name` + `artist` 組合唯一。匯出時自動合併同名歌曲。

##### Version

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 由 MizukiLens 生成的唯一 ID（格式：`mlens-ver-{uuid-v4-short}`，取 UUID v4 前 8 碼） |
| songId | string | 是 | 所屬歌曲 ID |
| streamId | string | 是 | 所屬直播場次 ID（= YouTube video ID） |
| startTimestamp | string | 是 | 開始時間戳（格式 `H:MM:SS`） |
| endTimestamp | string | 否 | 結束時間戳，省略時依 MizukiPrism 規則推算 |
| note | string | 否 | 演出備註 |

#### 4.3.2 本地快取結構（SQLite）

##### streams 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| video_id | TEXT PK | YouTube video ID |
| channel_id | TEXT | 所屬頻道 ID |
| title | TEXT | 影片標題 |
| date | TEXT | 直播日期 |
| status | TEXT | 場次狀態（discovered/extracted/pending/approved/exported/imported/excluded） |
| source | TEXT | 時間軸來源（comment/description/manual/null） |
| raw_comment | TEXT | 原始時間軸留言文字（供參考） |
| raw_description | TEXT | 原始描述欄文字 |
| created_at | TEXT | 首次發現時間 |
| updated_at | TEXT | 最後更新時間 |

##### parsed_songs 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER PK | 自增 ID |
| video_id | TEXT FK | 所屬場次 |
| order_index | INTEGER | 在場次中的順序 |
| song_name | TEXT | 歌曲名稱 |
| artist | TEXT | 原唱者（可為空） |
| start_timestamp | TEXT | 開始時間戳 |
| end_timestamp | TEXT | 結束時間戳（可為空） |
| note | TEXT | 演出備註（可為空） |

#### 4.3.3 設定檔格式（TOML）

```toml
[default]
active_channel = "mizuki"

[channels.mizuki]
id = "UC..."
name = "Mizuki"
keywords = ["歌回", "歌枠", "唱歌", "singing", "karaoke"]

[channels.another]
id = "UC..."
name = "Another Singer"
keywords = ["歌回", "歌枠"]

[cache]
path = "~/.local/share/mizukilens/cache.db"

[export]
output_dir = "~/.local/share/mizukilens/exports"
```
