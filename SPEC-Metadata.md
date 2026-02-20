# MizukiPrism 音樂後設資料整合規格書

## 1. Intent

### 1.1 Purpose

MizukiPrism Metadata Integration 透過外部 API（Deezer、LRCLIB）自動為歌曲目錄補充專輯封面、同步歌詞與原唱者資訊，提升粉絲的視覺體驗與互動參與感。所有外部 API 呼叫在伺服器端完成並快取為 JSON 檔案，粉絲端完全離線消費快取資料，不直接存取外部 API。

### 1.2 Users

| 角色 | 描述 | 核心任務 |
|------|------|----------|
| 粉絲（Fan） | 被動消費後設資料 | 瀏覽帶專輯封面的歌曲目錄、在播放時觀看同步歌詞 |
| 策展人（Curator） | 管理後設資料的取得與校正 | 觸發後設資料擷取、檢視匹配狀態、手動覆寫不正確的資料 |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 視覺豐富度 | 歌曲目錄、迷你播放器、正在播放模態框、播放佇列全面顯示專輯封面 |
| 粉絲參與度 | 播放時提供卡拉 OK 風格同步歌詞，提升跟唱體驗 |
| 歌曲發現 | 原唱者圖片與簡介增強瀏覽探索感 |
| 策展人效率 | 後設資料自動擷取，策展人僅需處理例外情況 |

### 1.4 Success Criteria

- [ ] 已快取後設資料的歌曲在所有 UI 位置（歌曲列表、迷你播放器、正在播放模態框、播放佇列）顯示專輯封面
- [ ] 有同步歌詞的歌曲在正在播放模態框中顯示卡拉 OK 風格歌詞滾動
- [ ] 新歌曲建立時自動觸發後台後設資料擷取
- [ ] 策展人可在管理介面檢視匹配狀態、手動觸發重新擷取、手動覆寫 URL 或歌詞
- [ ] 外部 API 不可用時，現有功能完全不受影響（專輯封面降級為漸層佔位圖、歌詞區顯示佔位文字）

### 1.5 Non-goals

- **非通用音樂資料庫**：僅為 MizukiPrism 目錄中的歌曲擷取後設資料，不建立獨立的音樂資料庫
- **非取代策展人資料**：外部 API 的歌名、原唱者不覆寫策展人手動維護的 `title` 與 `originalArtist`
- **非粉絲端直接 API 呼叫**：所有外部 API 呼叫在伺服器端完成，粉絲端僅讀取快取
- **非即時串流歌詞**：不提供 Mizuki 直播中的即時歌詞，僅為 VOD 回放提供原曲歌詞
- **非歌曲辨識**：不使用音訊指紋辨識歌曲，依賴策展人已維護的 `originalArtist` + `title` 進行 API 比對

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| Deezer 後設資料擷取（Deezer Metadata Fetch） | 以 `originalArtist` + `title` 搜尋 Deezer API，取得專輯封面 URL、曲目資訊與原唱者資訊 | 策展人（觸發）、系統（自動） |
| LRCLIB 歌詞擷取（LRCLIB Lyrics Fetch） | 以 `originalArtist` + `title` 搜尋 LRCLIB API，取得同步歌詞（LRC 格式）或純文字歌詞 | 策展人（觸發）、系統（自動） |
| 伺服器端後設資料快取（Server-side Metadata Cache） | 將擷取結果儲存為 `data/metadata/` 目錄下的 JSON 檔案，遵循現有檔案式資料層模式 | 系統 |
| 專輯封面顯示（Album Art Display） | 可重用的 `<AlbumArt>` 元件，在歌曲列表、迷你播放器、正在播放模態框、播放佇列中顯示專輯封面 | 粉絲 |
| 同步歌詞顯示（Synced Lyrics Display） | 正在播放模態框中顯示卡拉 OK 風格歌詞，隨播放進度自動滾動並高亮當前歌詞行 | 粉絲 |
| 策展人後設資料管理（Curator Metadata Management） | 管理介面中的後設資料狀態表、逐首重新擷取、批量重新擷取、手動覆寫 | 策展人 |

### 2.2 User Journeys

#### Journey 1：粉絲播放歌曲——自動顯示專輯封面與歌詞

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲在歌曲列表中選擇一首已有後設資料的歌曲版本播放 |
| 行動（Action） | 點擊播放按鈕 |
| 結果（Outcome） | 迷你播放器顯示專輯封面縮圖；展開正在播放模態框後，歌詞區顯示同步歌詞，隨播放進度自動滾動高亮 |

#### Journey 2：策展人新增歌曲——後設資料自動擷取

| 階段 | 內容 |
|------|------|
| 情境（Context） | 策展人在管理介面新增一首新歌曲版本 |
| 行動（Action） | 填寫歌名、原唱者並提交 |
| 結果（Outcome） | 系統在後台自動向 Deezer 與 LRCLIB 擷取後設資料；擷取完成後快取結果；下次粉絲載入頁面時即可看到專輯封面與歌詞 |

#### Journey 3：策展人處理缺失的後設資料

| 階段 | 內容 |
|------|------|
| 情境（Context） | 策展人在管理介面的後設資料分頁發現某首歌曲的擷取狀態為「未匹配」 |
| 行動（Action） | 手動貼上正確的專輯封面 URL，或手動觸發重新擷取 |
| 結果（Outcome） | 後設資料更新，粉絲端下次載入時顯示正確的專輯封面 |

#### Journey 4：粉絲瀏覽歌曲目錄——看到專輯封面縮圖

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲在首頁瀏覽歌曲列表 |
| 行動（Action） | 捲動瀏覽歌曲目錄 |
| 結果（Outcome） | 每首已有後設資料的歌曲在序號欄旁顯示小尺寸專輯封面縮圖；未有後設資料的歌曲顯示漸層佔位圖 |

## 3. Behavior

### 3.1 Feature Behaviors

#### 3.1.1 Deezer 後設資料擷取（Deezer Metadata Fetch）

##### 搜尋策略

系統以遞降信心度依序嘗試以下搜尋策略，取得第一個有結果的回應：

| 順序 | 策略 | Deezer API 查詢 | 信心度 |
|------|------|-----------------|--------|
| 1 | 結構化搜尋 | `artist:"${originalArtist}" track:"${title}"` | exact |
| 2 | 羅馬字回退 | 將日文/中文 `originalArtist` 轉為羅馬字後搜尋 | fuzzy |
| 3 | 簡化搜尋 | `${originalArtist} ${title}`（無結構化修飾） | fuzzy |
| 4 | 僅標題搜尋 | `track:"${title}"` | fuzzy |

- 每個策略若 Deezer 回傳結果，取第一筆結果
- 所有策略皆無結果時，標記 `fetchStatus: 'no_match'`
- 策略 2–4 取得結果時，標記 `matchConfidence: 'fuzzy'`

##### 擷取的資料

| 資料 | Deezer API 來源 | 用途 |
|------|-----------------|------|
| 專輯封面 URL | `track.album.cover_xl`（1000px）+ `cover_big`（500px）+ `cover_medium`（250px）+ `cover_small`（56px） | 各 UI 尺寸使用 |
| 曲目時長 | `track.duration` | 參考資訊 |
| 專輯名稱 | `track.album.title` | 參考資訊 |
| 原唱者圖片 | `track.artist.picture_xl`（1000px）+ `picture_big`（500px）+ `picture_medium`（250px） | Hero Section 原唱者資訊 |
| 原唱者 ID | `track.artist.id` | 建立 ArtistInfo 快取鍵 |

##### 速率限制

| 參數 | 值 | 說明 |
|------|-----|------|
| 單筆擷取間距 | 200ms | 每次 API 呼叫之間的最小間隔 |
| 批量擷取速率 | 最多 8 req/sec | 適用於批量重新擷取 |
| 逾時 | 5000ms | 單次 API 呼叫逾時，逾時後標記為錯誤 |

| 狀態 | 操作 | 結果 |
|------|------|------|
| 歌曲無後設資料 | 系統或策展人觸發擷取 | 依序嘗試搜尋策略，取得結果後儲存至快取 |
| 搜尋有結果 | — | 儲存 SongMetadata 與 ArtistInfo，標記 `fetchStatus: 'matched'` |
| 所有策略皆無結果 | — | 標記 `fetchStatus: 'no_match'`，UI 保持漸層佔位圖 |
| API 回傳 HTTP 錯誤 | — | 標記 `fetchStatus: 'error'`，記錄錯誤訊息，下次觸發時重試 |
| API 呼叫逾時 | — | 標記 `fetchStatus: 'error'`，記錄 `'timeout'` |
| 策展人手動覆寫 | 貼上自訂 `albumArtUrl` | 標記 `fetchStatus: 'manual'`，`matchConfidence: 'manual'`，不再自動覆寫 |

#### 3.1.2 LRCLIB 歌詞擷取（LRCLIB Lyrics Fetch）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 歌曲無歌詞 | 系統或策展人觸發擷取 | 以 `artist_name=${originalArtist}&track_name=${title}` 搜尋 LRCLIB `/api/search` |
| 搜尋有結果 | — | 優先取 `syncedLyrics` 不為空的結果；若無同步歌詞，取 `plainLyrics`；儲存至快取 |
| 搜尋無結果 | — | 標記 `fetchStatus: 'no_match'`，歌詞區顯示佔位文字 |
| API 錯誤 | — | 標記 `fetchStatus: 'error'`，下次觸發時重試 |
| 策展人手動覆寫 | 貼上自訂歌詞文字 | 標記 `fetchStatus: 'manual'`，不再自動覆寫 |

##### LRC 格式解析

同步歌詞以 LRC 格式儲存，每行格式為 `[MM:SS.xx] 歌詞文字`。解析為結構化陣列：

| 原始格式 | 解析結果 |
|----------|----------|
| `[01:23.45] 夜に駆ける` | `{ time: 83.45, text: "夜に駆ける" }` |
| `[00:05.00]` | `{ time: 5.0, text: "" }`（間奏/空行） |

解析規則：
- 時間戳格式：`[MM:SS.xx]`，其中 `xx` 為百分之一秒（可省略）
- 忽略不含時間戳的行
- 空文字行（間奏）保留為 `text: ""`

#### 3.1.3 伺服器端後設資料快取（Server-side Metadata Cache）

##### 檔案結構

```
data/
├── songs.json          （既有）
├── streams.json        （既有）
└── metadata/
    ├── song-metadata.json    ─ SongMetadata[]
    ├── song-lyrics.json      ─ SongLyrics[]
    └── artist-info.json      ─ ArtistInfo[]
```

##### 快取行為

| 狀態 | 操作 | 結果 |
|------|------|------|
| 歌曲建立 | 策展人新增歌曲版本 | 系統自動在後台觸發 Deezer + LRCLIB 擷取，結果寫入快取檔案 |
| 策展人手動觸發 | 點擊「重新擷取」按鈕 | 重新呼叫 API 並覆寫快取（`fetchStatus: 'manual'` 的條目除外，需先清除才能重新擷取） |
| 批量重新擷取 | 點擊「重新擷取全部」或「重新擷取過期」 | 依序處理所有目標歌曲，遵守速率限制 |
| 快取條目已過期 | 條目 `fetchedAt` 超過 90 天 | 標記為過期（stale），策展人可選擇批量重新擷取 |
| 讀取路徑 | 粉絲端載入 `/api/songs` | API 回應中合併 SongMetadata 的 `albumArtUrl`；歌詞不包含在歌曲列表中 |
| 讀取路徑 | 粉絲端請求 `/api/songs/[id]/lyrics` | 回傳該歌曲的 SongLyrics |
| 快取檔案不存在 | 系統首次啟動 | 建立空陣列 JSON 檔案 |

##### 快取一致性

- 刪除歌曲時，對應的 SongMetadata 與 SongLyrics 條目一併移除
- 歌曲的 `originalArtist` 或 `title` 被策展人修改時，現有後設資料**不自動更新**（避免覆寫手動覆寫的資料），策展人可手動觸發重新擷取

#### 3.1.4 專輯封面顯示（Album Art Display）

可重用的 `<AlbumArt>` 元件，在以下位置顯示專輯封面：

| 位置 | 尺寸 | Deezer 圖片來源 | 說明 |
|------|------|-----------------|------|
| 歌曲列表資料列（SongRow） | 32×32 | `cover_small`（56px） | 序號欄旁的縮圖 |
| 迷你播放器（MiniPlayer）桌面版 | 48×48 | `cover_small`（56px） | 左欄封面 |
| 迷你播放器（MiniPlayer）行動版 | 40×40 | `cover_small`（56px） | 內容列封面 |
| 正在播放模態框（NowPlayingModal） | 300×300 | `cover_xl`（1000px） | 主視覺 |
| 播放佇列項目（QueueItem） | 40×40 | `cover_small`（56px） | 佇列列表縮圖 |
| Hero Section 原唱者頭像 | 180×180 | `artist.picture_big`（500px） | 原唱者資訊展示 |

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有封面 URL | 元件渲染 | 顯示 `<img>` 搭配圓角（`radius-sm`），使用 `object-cover` 填充 |
| 圖片載入失敗 | `onError` 事件 | 降級為漸層佔位圖 + Music 圖示（既有樣式） |
| 無封面 URL | 元件渲染 | 直接顯示漸層佔位圖 + Music 圖示 |
| 圖片載入中 | — | 顯示漸層佔位圖（避免佈局跳動） |

`<AlbumArt>` 元件 Props：

| Prop | 型別 | 必填 | 說明 |
|------|------|------|------|
| `src` | `string \| undefined` | 否 | 專輯封面 URL |
| `alt` | `string` | 是 | 替代文字（歌名 + 原唱者） |
| `size` | `number` | 是 | 尺寸（px），同時設定寬高 |

#### 3.1.5 同步歌詞顯示（Synced Lyrics Display）

在正在播放模態框（NowPlayingModal）中，原有的影片佔位區域下方新增歌詞區：

##### 歌詞行狀態

| 狀態 | 樣式 | 說明 |
|------|------|------|
| 當前行（active） | `accent-pink`，fontSize 18px，fontWeight 700 | 正在演唱的歌詞行 |
| 即將到來（upcoming） | `text-secondary`，fontSize 16px，fontWeight 400 | 尚未到達的歌詞行 |
| 已過（past） | `text-tertiary`，fontSize 16px，fontWeight 400，opacity 0.5 | 已演唱完的歌詞行 |

##### 行為

| 狀態 | 操作 | 結果 |
|------|------|------|
| 有同步歌詞 | 播放進行中 | 根據 `PlayerContext.currentTime` 定位當前行（見當前行定位規則）；當前行高亮並自動捲動至容器中央 |
| 有同步歌詞 | 使用者手動捲動歌詞區 | 暫停自動捲動 5 秒，之後恢復自動捲動 |
| 僅有純文字歌詞 | 播放進行中 | 以靜態文字顯示歌詞全文，不高亮、不自動捲動 |
| 無歌詞 | — | 歌詞區顯示佔位文字「目前沒有歌詞」 |
| 歌詞行為空（間奏） | 播放經過空行 | 跳過空行，高亮下一個有文字的行 |

##### 自動捲動

- 當前行平滑捲動至歌詞容器的垂直中央
- 手動捲動偵測：監聽歌詞容器的捲動事件，觸發時設定 5 秒計時器，期間停止自動捲動
- 計時器到期後恢復自動捲動

##### 當前行定位規則

```
給定 currentTime 與 LyricLine[] lines：
1. 找到最大的 i 使得 lines[i].time <= currentTime
2. 該 i 即為當前行（active）
3. i 之前的行為 past，i 之後的行為 upcoming
4. 若無任何行的 time <= currentTime，則所有行皆為 upcoming
```

#### 3.1.6 策展人後設資料管理（Curator Metadata Management）

在管理介面（`/admin`）新增「後設資料」分頁，與現有的「直播場次」和「歌曲目錄」分頁並列。

##### 後設資料狀態表

| 欄位 | 說明 |
|------|------|
| 歌名 | 歌曲 `title` |
| 原唱者 | 歌曲 `originalArtist` |
| 封面狀態 | matched / no_match / error / manual / pending（尚未擷取） |
| 歌詞狀態 | matched / no_match / error / manual / pending |
| 匹配信心度 | exact / fuzzy / manual / —（無資料） |
| 上次擷取 | `fetchedAt` 日期 |

##### 操作

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 點擊單首歌曲「重新擷取」 | 重新呼叫 Deezer + LRCLIB API，更新快取（`manual` 狀態的條目需先清除） |
| 任意 | 點擊「重新擷取全部」 | 對所有非 `manual` 狀態的歌曲逐首擷取，遵守速率限制 |
| 任意 | 點擊「重新擷取過期」 | 僅對 `fetchedAt` 超過 90 天的歌曲重新擷取 |
| 任意 | 點擊「清除」 | 移除該歌曲的快取條目，恢復為 pending 狀態 |
| 任意 | 手動覆寫封面 URL | 策展人貼上 URL → 標記 `fetchStatus: 'manual'`，`matchConfidence: 'manual'` |
| 任意 | 手動覆寫歌詞 | 策展人貼上歌詞文字 → 標記 `fetchStatus: 'manual'` |

##### 擷取進行中的 UI 行為

| 狀態 | 操作 | 結果 |
|------|------|------|
| 單首擷取中 | 策展人點擊「重新擷取」 | 該列顯示 spinner 取代狀態文字；按鈕停用（disabled）；擷取完成後自動更新狀態 |
| 批量擷取中 | 策展人點擊「重新擷取全部」或「重新擷取過期」 | 頂部顯示進度列與計數（例：「擷取中 23/150」）；個別歌曲完成後即時更新其狀態列 |
| 批量擷取中 | 策展人點擊「停止」 | 取消剩餘擷取，已完成的結果保留；顯示摘要（成功 N 筆、失敗 N 筆、已取消 N 筆） |
| 批量擷取中 | 策展人離開後設資料分頁 | 擷取在後台繼續；返回分頁時顯示最新狀態 |

### 3.2 Error Scenarios

| 功能範圍 | 錯誤情境 | 系統行為 |
|----------|----------|----------|
| Deezer 擷取 | API 回傳 0 筆結果（所有搜尋策略） | `fetchStatus: 'no_match'`，UI 顯示漸層佔位圖 |
| Deezer 擷取 | API 回傳 HTTP 4xx/5xx | `fetchStatus: 'error'`，記錄錯誤訊息至 `lastError`，下次觸發時重試 |
| Deezer 擷取 | API 呼叫逾時（>5 秒） | `fetchStatus: 'error'`，`lastError: 'timeout'` |
| LRCLIB 擷取 | API 回傳 0 筆結果 | `fetchStatus: 'no_match'`，歌詞區顯示「目前沒有歌詞」 |
| LRCLIB 擷取 | API 回傳 HTTP 錯誤 | `fetchStatus: 'error'`，記錄錯誤訊息 |
| 專輯封面顯示 | 圖片 URL 載入失敗（404、網路錯誤） | `<AlbumArt>` 元件 `onError` 降級為漸層佔位圖 |
| 歌詞顯示 | LRC 格式解析失敗（格式異常） | 將原始文字視為純文字歌詞顯示 |
| 快取 | 快取 JSON 檔案損毀 | 建立空陣列並記錄警告；不影響核心歌曲目錄功能 |
| 網路 | 伺服器端無法連線至外部 API | 僅影響擷取功能；既有快取資料不受影響，粉絲端正常運作 |
| 批量擷取 | 中途發生錯誤 | 記錄失敗的歌曲，繼續處理剩餘歌曲；完成後顯示摘要 |

### 3.3 System Boundary

| 類型 | MizukiPrism 控制 | MizukiPrism 依賴（外部） |
|------|------------------|--------------------------|
| 責任 | 後設資料的快取管理、UI 顯示、策展人管理介面、搜尋策略、速率限制 | 不負責外部 API 的可用性、資料正確性、圖片託管 |
| 互動 | 提供歌詞 API、快取讀寫、專輯封面元件 | 輸入：Deezer Search API（`api.deezer.com/search`）、LRCLIB API（`lrclib.net/api`） |
| 控制 | 搜尋策略順序、快取生命週期、歌詞顯示邏輯、速率限制參數 | Deezer API 可用性與速率限制、LRCLIB API 可用性與覆蓋率、CDN 圖片可用性 |

### 3.4 Assumptions & Constraints

| 假設 | 說明 |
|------|------|
| Deezer API 免驗證 | Deezer Search API 無需 API key 或 OAuth，公開存取 |
| LRCLIB API 免驗證 | LRCLIB API 無需 API key，公開存取 |
| J-POP 覆蓋率 | Deezer 的日本音樂覆蓋率高但非 100%；部分獨立或同人曲目可能無法匹配 |
| 原唱者一致性 | 搜尋以策展人維護的 `originalArtist` 為準，拼寫差異可能影響匹配率 |
| 圖片 URL 有效性 | Deezer 提供的圖片 URL 長期有效，但不保證永久；90 天過期重新擷取可緩解此風險 |
| 快取規模 | 預期歌曲數量在 ~2000 首以內，三個 JSON 快取檔案總大小預估 <5 MB |
| 伺服器端擷取 | 所有 API 呼叫在 Next.js API route 或伺服器動作中執行，不在客戶端瀏覽器中執行 |
| 檔案系統可寫 | 部署環境的 `data/` 目錄在執行時可寫入（與既有 `songs.json`、`streams.json` 一致），不適用於唯讀檔案系統的 Serverless 部署 |

## 4. Refinement

### 4.1 Terminology

| 術語 | 英文 | 定義 |
|------|------|------|
| 歌曲後設資料 | SongMetadata | 從 Deezer API 擷取的歌曲相關資訊，包含專輯封面 URL、匹配信心度與擷取狀態。每首歌曲最多一筆。 |
| 歌曲歌詞 | SongLyrics | 從 LRCLIB API 擷取的歌詞資料，可為同步歌詞（LRC 格式）或純文字。每首歌曲最多一筆。 |
| 原唱者資訊 | ArtistInfo | 從 Deezer API 擷取的原唱者相關資訊，包含圖片 URL。以正規化的原唱者名稱為鍵，多首歌曲可共用同一筆。 |
| 歌詞行 | LyricLine | 同步歌詞中的一行，包含時間戳（秒）與歌詞文字。 |
| 擷取狀態 | fetchStatus | 後設資料的擷取結果狀態：`matched`（已匹配）、`no_match`（無匹配）、`error`（擷取失敗）、`manual`（手動覆寫）、`pending`（尚未擷取）。 |
| 匹配信心度 | matchConfidence | 搜尋結果與原曲的匹配程度：`exact`（結構化搜尋命中）、`fuzzy`（回退策略命中）、`manual`（手動覆寫）。 |
| 過期 | stale | 快取條目的 `fetchedAt` 距今超過 90 天，建議重新擷取。 |

### 4.2 Patterns

#### 4.2.1 歌曲與後設資料的關係

```
Song (1) ←──── (0..1) SongMetadata    by songId
Song (1) ←──── (0..1) SongLyrics      by songId
Song (*) ────→ (0..1) ArtistInfo       by normalizedArtist
```

- 一首歌曲最多對應一筆 SongMetadata 和一筆 SongLyrics
- 多首歌曲可共用同一筆 ArtistInfo（同一原唱者的不同歌曲）
- ArtistInfo 以正規化的原唱者名稱為鍵（小寫、去除空白）
- SongMetadata 與 SongLyrics 各自獨立擷取，任一失敗不影響另一個

#### 4.2.2 擷取觸發時機

| 觸發時機 | 觸發方式 | 說明 |
|----------|----------|------|
| 歌曲建立 | 自動 | 策展人新增歌曲版本時，系統自動在後台擷取（不阻塞 API 回應） |
| 策展人手動觸發 | 手動 | 管理介面逐首或批量觸發 |
| 批量重新擷取過期 | 手動 | 管理介面按鈕，僅處理 `fetchedAt` 超過 90 天的條目 |

#### 4.2.3 正規化的原唱者名稱演算法

用於 ArtistInfo 的快取鍵：

```
normalizeArtist(name: string): string
  1. 轉為小寫
  2. 去除首尾空白
  3. 將連續空白壓縮為單一空白
  4. 結果作為 ArtistInfo 的 key
```

範例：`"YOASOBI"` → `"yoasobi"`、`"  宇多田 光  "` → `"宇多田 光"`

#### 4.2.4 API 回應合併策略

`/api/songs` 端點在回傳歌曲列表時，將 SongMetadata 的 `albumArtUrl` 合併至每首歌曲的回應中：

```
GET /api/songs 回應結構：
[
  {
    ...Song,                    // 既有欄位
    albumArtUrl?: string,       // 來自 SongMetadata
    matchConfidence?: string    // 來自 SongMetadata
  }
]
```

歌詞資料不在歌曲列表中返回，由獨立端點提供以避免首頁載入過重。

### 4.3 Data Contracts

以下為新增的資料實體定義。欄位名稱遵循 `lib/types.ts` 既有慣例（`title`、`originalArtist`、`performances: Performance[]`）。

#### SongMetadata（歌曲後設資料）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| songId | string | 是 | 對應的歌曲 ID（與 Song.id 對應） |
| fetchStatus | `'matched' \| 'no_match' \| 'error' \| 'manual' \| 'pending'` | 是 | 擷取狀態 |
| matchConfidence | `'exact' \| 'fuzzy' \| 'manual' \| null` | 否 | 匹配信心度，`fetchStatus` 非 `matched` 或 `manual` 時為 `null` |
| albumArtUrl | string | 否 | 專輯封面 URL，固定為 `albumArtUrls.xl`（1000px）的便利別名 |
| albumArtUrls | `{ small: string; medium: string; big: string; xl: string }` | 否 | 各尺寸專輯封面 URL |
| albumTitle | string | 否 | 專輯名稱 |
| deezerTrackId | number | 否 | Deezer 曲目 ID（供除錯與回溯） |
| deezerArtistId | number | 否 | Deezer 原唱者 ID |
| trackDuration | number | 否 | Deezer 回報的曲目時長（秒） |
| fetchedAt | string | 是 | 最後擷取時間（ISO 8601） |
| lastError | string | 否 | 最近一次錯誤訊息 |

**唯一性約束**：`songId` 唯一。

#### SongLyrics（歌曲歌詞）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| songId | string | 是 | 對應的歌曲 ID |
| fetchStatus | `'matched' \| 'no_match' \| 'error' \| 'manual' \| 'pending'` | 是 | 擷取狀態 |
| syncedLyrics | string | 否 | LRC 格式的同步歌詞原始文字 |
| plainLyrics | string | 否 | 純文字歌詞 |
| fetchedAt | string | 是 | 最後擷取時間（ISO 8601） |
| lastError | string | 否 | 最近一次錯誤訊息 |

**唯一性約束**：`songId` 唯一。

#### ArtistInfo（原唱者資訊）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| normalizedArtist | string | 是 | 正規化的原唱者名稱（快取鍵） |
| originalName | string | 是 | 原始原唱者名稱（來自 Deezer） |
| deezerArtistId | number | 是 | Deezer 原唱者 ID |
| pictureUrls | `{ medium: string; big: string; xl: string }` | 否 | 各尺寸原唱者圖片 URL |
| fetchedAt | string | 是 | 最後擷取時間（ISO 8601） |

**唯一性約束**：`normalizedArtist` 唯一。

#### LyricLine（歌詞行，前端解析後的結構）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| time | number | 是 | 時間戳（秒，含小數） |
| text | string | 是 | 歌詞文字（空字串表示間奏） |

> **注意**：LyricLine 不儲存於快取檔案，而是前端從 `SongLyrics.syncedLyrics` 的 LRC 文字動態解析。

### 4.4 New API Routes

| 路由 | 方法 | 說明 | 使用者 |
|------|------|------|--------|
| `GET /api/songs` | GET | 既有端點，擴充回應以包含 `albumArtUrl` 與 `matchConfidence` | 粉絲 |
| `GET /api/songs/[id]/lyrics` | GET | 回傳指定歌曲的歌詞（同步歌詞優先，回退至純文字） | 粉絲 |
| `POST /api/metadata/refresh` | POST | 觸發指定歌曲的後設資料重新擷取 | 策展人 |
| `POST /api/metadata/refresh-all` | POST | 觸發所有非 `manual` 狀態歌曲的批量重新擷取 | 策展人 |
| `POST /api/metadata/refresh-stale` | POST | 觸發所有過期（>90 天）歌曲的批量重新擷取 | 策展人 |
| `PUT /api/metadata/[songId]` | PUT | 手動覆寫指定歌曲的後設資料（封面 URL 或歌詞） | 策展人 |
| `DELETE /api/metadata/[songId]` | DELETE | 清除指定歌曲的後設資料快取 | 策展人 |

> **策展人驗證**：所有 `POST /api/metadata/*`、`PUT /api/metadata/*`、`DELETE /api/metadata/*` 路由需經策展人驗證（與 SPEC.md §3.1.6 相同的共用密鑰機制）。粉絲端的 `GET` 路由不需驗證。

##### 請求/回應格式

**`POST /api/metadata/refresh`**

```json
// Request body
{ "songId": "song-123" }

// Response 200
{ "status": "ok", "songId": "song-123" }
```

**`PUT /api/metadata/[songId]`**（部分更新語義）

```json
// Request body — 所有欄位皆為選填，僅提供的欄位會被覆寫
{
  "albumArtUrl": "https://example.com/cover.jpg",  // 選填：手動覆寫封面
  "syncedLyrics": "[00:05.00] 歌詞第一行...",        // 選填：手動覆寫同步歌詞
  "plainLyrics": "歌詞全文..."                       // 選填：手動覆寫純文字歌詞
}

// Response 200
{ "status": "ok", "songId": "song-123" }
```

### 4.5 Constraints

| 約束 | 說明 |
|------|------|
| 離線優先 | 粉絲端完全從伺服器快取讀取，不直接存取 Deezer 或 LRCLIB |
| 優雅降級 | 任何後設資料缺失或錯誤不影響核心功能（歌曲瀏覽、播放、播放清單） |
| J-POP 覆蓋缺口 | 部分獨立曲目可能在 Deezer 或 LRCLIB 中找不到；系統設計已預期此情況 |
| 不自動覆寫策展人資料 | 外部 API 回傳的歌名/原唱者不覆寫 Song 實體的 `title` / `originalArtist`，僅儲存於 SongMetadata 供參考 |
| 速率限制遵守 | Deezer API 無官方速率限制文件，以保守的 8 req/sec 執行批量操作 |
