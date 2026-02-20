# MizukiPrism 音樂後設資料整合規格書

## 1. Intent

### 1.1 Purpose

MizukiPrism Metadata Integration 透過外部 API（Deezer、LRCLIB）自動為歌曲目錄補充專輯封面、同步歌詞與原唱者資訊，提升粉絲的視覺體驗與互動參與感。所有外部 API 呼叫由 MizukiLens CLI 於本地擷取並寫入靜態 JSON 檔案，隨原始碼提交並部署為靜態資產；粉絲端完全離線消費靜態資料，不直接存取外部 API。

### 1.2 Users

| 角色 | 描述 | 核心任務 |
|------|------|----------|
| 粉絲（Fan） | 被動消費後設資料 | 瀏覽帶專輯封面的歌曲目錄、在播放時觀看同步歌詞 |
| 策展人（Curator） | 管理後設資料的取得與校正 | 透過 CLI 執行擷取、檢視狀態、手動覆寫，提交後部署 |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 視覺豐富度 | 歌曲目錄、迷你播放器、正在播放模態框、播放佇列全面顯示專輯封面 |
| 粉絲參與度 | 播放時提供卡拉 OK 風格同步歌詞，提升跟唱體驗 |
| 歌曲發現 | 原唱者圖片與簡介增強瀏覽探索感 |
| 策展人效率 | CLI 批量擷取搭配 Rich 進度條，策展人僅需處理例外情況 |

### 1.4 Success Criteria

- [ ] 已有後設資料的歌曲在所有 UI 位置（歌曲列表、迷你播放器、正在播放模態框、播放佇列）顯示專輯封面
- [ ] 有同步歌詞的歌曲在正在播放模態框中顯示卡拉 OK 風格歌詞滾動
- [ ] 策展人可透過 CLI 批量擷取新歌曲的後設資料
- [ ] 策展人可透過 CLI 檢視匹配狀態、手動觸發重新擷取、手動覆寫 URL 或歌詞
- [ ] 外部 API 不可用時，現有功能完全不受影響（專輯封面降級為漸層佔位圖、歌詞區顯示佔位文字）

### 1.5 Non-goals

- **非通用音樂資料庫**：僅為 MizukiPrism 目錄中的歌曲擷取後設資料，不建立獨立的音樂資料庫
- **非取代策展人資料**：外部 API 的歌名、原唱者不覆寫策展人手動維護的 `title` 與 `originalArtist`
- **非粉絲端直接 API 呼叫**：所有外部 API 呼叫由 CLI 離線完成，粉絲端僅讀取靜態檔案
- **非伺服器端後設資料管理**：所有擷取與管理操作透過 CLI 離線完成，部署後為純靜態站
- **非即時串流歌詞**：不提供 Mizuki 直播中的即時歌詞，僅為 VOD 回放提供原曲歌詞
- **非歌曲辨識**：不使用音訊指紋辨識歌曲，依賴策展人已維護的 `originalArtist` + `title` 進行 API 比對

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| Deezer 後設資料擷取（Deezer Metadata Fetch） | 以 `originalArtist` + `title` 搜尋 Deezer API，取得專輯封面 URL、曲目資訊與原唱者資訊 | 策展人（CLI 觸發） |
| LRCLIB 歌詞擷取（LRCLIB Lyrics Fetch） | 以 `originalArtist` + `title` 搜尋 LRCLIB API，取得同步歌詞（LRC 格式）或純文字歌詞 | 策展人（CLI 觸發） |
| 靜態後設資料檔案（Static Metadata Files） | 將擷取結果儲存為 `data/metadata/` 目錄下的 JSON 檔案，隨原始碼提交並部署為靜態資產 | 系統 |
| 專輯封面顯示（Album Art Display） | 可重用的 `<AlbumArt>` 元件，在歌曲列表、迷你播放器、正在播放模態框、播放佇列中顯示專輯封面 | 粉絲 |
| 同步歌詞顯示（Synced Lyrics Display） | 正在播放模態框中顯示卡拉 OK 風格歌詞，隨播放進度自動滾動並高亮當前歌詞行 | 粉絲 |
| CLI 後設資料管理（CLI Metadata Management） | MizukiLens CLI 的後設資料子命令：擷取、狀態檢視、手動覆寫、清除 | 策展人 |

### 2.2 User Journeys

#### Journey 1：粉絲播放歌曲——自動顯示專輯封面與歌詞

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲在歌曲列表中選擇一首已有後設資料的歌曲版本播放 |
| 行動（Action） | 點擊播放按鈕 |
| 結果（Outcome） | 迷你播放器顯示專輯封面縮圖；展開正在播放模態框後，歌詞區顯示同步歌詞，隨播放進度自動滾動高亮 |

#### Journey 2：策展人匯入歌曲後——透過 CLI 擷取後設資料

| 階段 | 內容 |
|------|------|
| 情境（Context） | 策展人透過 `mizukilens import` 匯入了新歌曲 |
| 行動（Action） | 執行 `mizukilens metadata fetch --missing` |
| 結果（Outcome） | CLI 以 Rich 進度條顯示擷取進度，向 Deezer 與 LRCLIB 擷取後設資料並寫入 `data/metadata/*.json`；策展人確認結果後 commit 並 push，下次部署後粉絲即可看到專輯封面與歌詞 |

#### Journey 3：策展人處理缺失的後設資料

| 階段 | 內容 |
|------|------|
| 情境（Context） | 策展人執行 `mizukilens metadata status`，發現某首歌曲的擷取狀態為 `no_match` |
| 行動（Action） | 執行 `mizukilens metadata override <song-id> --album-art-url <URL>` 手動指定封面 |
| 結果（Outcome） | 後設資料 JSON 更新為 `manual` 狀態；策展人 commit 並 push，部署後粉絲端顯示正確的專輯封面 |

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
| 原唱者 ID | `track.artist.id` | 建立 ArtistInfo 查詢鍵 |

##### 速率限制

| 參數 | 值 | 說明 |
|------|-----|------|
| 單筆擷取間距 | 200ms | 每次 API 呼叫之間的最小間隔 |
| 批量擷取速率 | 最多 8 req/sec | 適用於批量重新擷取 |
| 逾時 | 5000ms | 單次 API 呼叫逾時，逾時後標記為錯誤 |

| 狀態 | 操作 | 結果 |
|------|------|------|
| 歌曲無後設資料 | 策展人透過 CLI 觸發擷取 | 依序嘗試搜尋策略，取得結果後儲存至靜態 JSON |
| 搜尋有結果 | — | 儲存 SongMetadata 與 ArtistInfo，標記 `fetchStatus: 'matched'` |
| 所有策略皆無結果 | — | 標記 `fetchStatus: 'no_match'`，UI 保持漸層佔位圖 |
| API 回傳 HTTP 錯誤 | — | 標記 `fetchStatus: 'error'`，記錄錯誤訊息，下次觸發時重試 |
| API 呼叫逾時 | — | 標記 `fetchStatus: 'error'`，記錄 `'timeout'` |
| 策展人手動覆寫 | 貼上自訂 `albumArtUrl` | 標記 `fetchStatus: 'manual'`，`matchConfidence: 'manual'`，不再自動覆寫 |

#### 3.1.2 LRCLIB 歌詞擷取（LRCLIB Lyrics Fetch）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 歌曲無歌詞 | 策展人透過 CLI 觸發擷取 | 以 `artist_name=${originalArtist}&track_name=${title}` 搜尋 LRCLIB `/api/search` |
| 搜尋有結果 | — | 優先取 `syncedLyrics` 不為空的結果；若無同步歌詞，取 `plainLyrics`；儲存至靜態 JSON |
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

#### 3.1.3 靜態後設資料檔案（Static Metadata Files）

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

##### CLI 寫入行為

| 觸發情境 | CLI 指令 | 結果 |
|----------|----------|------|
| 匯入後擷取 | `metadata fetch --missing` | 為尚無後設資料的歌曲擷取 |
| 過期重新擷取 | `metadata fetch --stale` | 重新擷取 `fetchedAt` 超過 90 天的條目 |
| 單首擷取 | `metadata fetch --song <id>` | 擷取指定歌曲 |
| 全量重新擷取 | `metadata fetch --all` | 重新擷取所有歌曲（跳過 `manual` 狀態） |
| 手動覆寫 | `metadata override <id>` | 標記為 `manual` 狀態 |
| 清除條目 | `metadata clear <id>` | 移除條目，允許重新擷取 |

##### 前端讀取行為

| 動作 | 行為 |
|------|------|
| 頁面載入 | 前端 fetch `/data/metadata/song-metadata.json`，將 `albumArtUrl` 客戶端合併至歌曲列表 |
| 歌曲播放 | 前端 fetch `/data/metadata/song-lyrics.json`（延遲載入，首次開啟歌詞面板時觸發），以 songId 查詢歌詞 |

> **歌詞檔案策略**：使用單一 `song-lyrics.json` 而非逐首歌曲建立檔案。預估 ~2000 首歌曲 × ~3KB 平均 ≈ 3–5MB，僅在歌詞面板開啟時延遲載入。逐首建立檔案會在 git 中產生數千個檔案。

##### 資料一致性

- 刪除歌曲時，策展人應透過 `metadata clear <id>` 移除對應的 SongMetadata 與 SongLyrics 條目
- 歌曲的 `originalArtist` 或 `title` 被策展人修改時，現有後設資料**不自動更新**（避免覆寫手動覆寫的資料），策展人可透過 CLI 手動觸發重新擷取

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

#### 3.1.6 CLI 後設資料管理（CLI Metadata Management）

策展人透過 MizukiLens CLI 的 `metadata` 子命令群組管理後設資料，遵循既有 CLI 模式（Rich 進度條、表格輸出）。

##### 指令一覽

**`mizukilens metadata fetch`** — 擷取後設資料

```
mizukilens metadata fetch [--all|--missing|--stale|--song ID] [--force] [--lyrics-only|--art-only]
```

| 選項 | 說明 |
|------|------|
| `--missing`（預設） | 僅擷取尚無後設資料的歌曲 |
| `--stale` | 僅重新擷取 `fetchedAt` 超過 90 天的條目 |
| `--all` | 重新擷取所有歌曲（跳過 `manual` 狀態，除非搭配 `--force`） |
| `--song ID` | 擷取指定歌曲 |
| `--force` | 強制覆寫 `manual` 狀態的條目 |
| `--lyrics-only` | 僅擷取歌詞（LRCLIB） |
| `--art-only` | 僅擷取封面（Deezer） |

輸出：Rich 進度條顯示擷取進度，完成後顯示摘要表格（成功 N 筆、失敗 N 筆、跳過 N 筆）。

**`mizukilens metadata status`** — 檢視後設資料狀態

```
mizukilens metadata status [--detail] [--filter STATUS]
```

| 選項 | 說明 |
|------|------|
| `--detail` | 顯示完整資訊（包含 URL、匹配信心度、擷取時間） |
| `--filter STATUS` | 篩選指定狀態（`matched` / `no_match` / `error` / `manual` / `pending`） |

輸出：Rich 表格顯示歌名、原唱者、封面狀態、歌詞狀態、匹配信心度、上次擷取時間。

**`mizukilens metadata override`** — 手動覆寫後設資料

```
mizukilens metadata override SONG_ID [--album-art-url URL] [--lyrics FILE]
```

| 選項 | 說明 |
|------|------|
| `--album-art-url URL` | 手動指定專輯封面 URL |
| `--lyrics FILE` | 手動指定歌詞檔案（LRC 或純文字） |

結果：標記 `fetchStatus: 'manual'`，`matchConfidence: 'manual'`，後續自動擷取不覆寫。

**`mizukilens metadata clear`** — 清除後設資料

```
mizukilens metadata clear SONG_ID [--all] [--force]
```

| 選項 | 說明 |
|------|------|
| `SONG_ID` | 清除指定歌曲的後設資料 |
| `--all` | 清除所有歌曲的後設資料 |
| `--force` | 跳過確認提示 |

結果：移除對應的 SongMetadata 與 SongLyrics 條目，恢復為可重新擷取的狀態。

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
| 靜態檔案 | 後設資料 JSON 檔案損毀 | CLI 建立空陣列並記錄警告；不影響核心歌曲目錄功能 |
| 網路 | CLI 無法連線至外部 API | 僅影響擷取功能；既有靜態資料不受影響，粉絲端正常運作 |
| 批量擷取 | CLI 擷取中途發生錯誤 | 記錄失敗的歌曲，繼續處理剩餘歌曲；完成後顯示摘要 |

### 3.3 System Boundary

| 類型 | MizukiPrism 控制 | MizukiPrism 依賴（外部） |
|------|------------------|--------------------------|
| 責任 | 後設資料的靜態檔案管理、UI 顯示、MizukiLens CLI 擷取流程、搜尋策略、速率限制 | 不負責外部 API 的可用性、資料正確性、圖片託管 |
| 互動 | 提供靜態 JSON 檔案、客戶端合併邏輯、專輯封面元件 | 輸入：Deezer Search API（`api.deezer.com/search`）、LRCLIB API（`lrclib.net/api`） |
| 控制 | 搜尋策略順序、靜態檔案生命週期、歌詞顯示邏輯、速率限制參數 | Deezer API 可用性與速率限制、LRCLIB API 可用性與覆蓋率、CDN 圖片可用性 |

### 3.4 Assumptions & Constraints

| 假設 | 說明 |
|------|------|
| Deezer API 免驗證 | Deezer Search API 無需 API key 或 OAuth，公開存取 |
| LRCLIB API 免驗證 | LRCLIB API 無需 API key，公開存取 |
| J-POP 覆蓋率 | Deezer 的日本音樂覆蓋率高但非 100%；部分獨立或同人曲目可能無法匹配 |
| 原唱者一致性 | 搜尋以策展人維護的 `originalArtist` 為準，拼寫差異可能影響匹配率 |
| 圖片 URL 有效性 | Deezer 提供的圖片 URL 長期有效，但不保證永久；90 天過期重新擷取可緩解此風險 |
| 檔案規模 | 預期歌曲數量在 ~2000 首以內，三個 JSON 靜態檔案總大小預估 <5 MB |
| 靜態部署 | 部署至 GitHub Pages，完全靜態，執行時無寫入能力 |
| Git 版本控制資料 | 後設資料 JSON 檔案與 `songs.json` 一同納入版本控制，隨原始碼提交 |
| 部署延遲 | 後設資料變更需經 commit → push → deploy 流程後，粉絲端才可見 |
| MizukiLens 依賴 | 後設資料擷取與管理需安裝 MizukiLens Python CLI 工具 |

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
| 過期 | stale | 靜態檔案條目的 `fetchedAt` 距今超過 90 天，建議重新擷取。 |
| 靜態合併 | static merge | 前端在客戶端將 `song-metadata.json` 的資料合併至歌曲列表，不依賴伺服器端合併。 |

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

| 觸發時機 | CLI 指令 | 說明 |
|----------|----------|------|
| 匯入後擷取 | `metadata fetch --missing` | 策展人匯入新歌曲後，擷取尚無後設資料的歌曲 |
| 單首擷取 | `metadata fetch --song <id>` | 策展人手動擷取指定歌曲 |
| 過期重新擷取 | `metadata fetch --stale` | 僅處理 `fetchedAt` 超過 90 天的條目 |
| 全量重新擷取 | `metadata fetch --all` | 重新擷取所有歌曲（跳過 `manual` 狀態） |

#### 4.2.3 正規化的原唱者名稱演算法

用於 ArtistInfo 的查詢鍵：

```
normalizeArtist(name: string): string
  1. 轉為小寫
  2. 去除首尾空白
  3. 將連續空白壓縮為單一空白
  4. 結果作為 ArtistInfo 的 key
```

範例：`"YOASOBI"` → `"yoasobi"`、`"  宇多田 光  "` → `"宇多田 光"`

#### 4.2.4 客戶端合併策略（Client-side Merge Strategy）

前端在客戶端將後設資料合併至歌曲列表，不依賴伺服器端合併：

```
客戶端合併演算法：
1. Fetch songs.json → Song[]
2. Fetch /data/metadata/song-metadata.json → SongMetadata[]
3. 建立 Map<songId, SongMetadata>
4. 遍歷 Song[]，為每首歌曲附加 albumArtUrl、matchConfidence
5. 歌詞延遲載入：NowPlayingModal 開啟時才 fetch song-lyrics.json
```

```
合併後結構（前端記憶體中）：
[
  {
    ...Song,                    // 既有欄位
    albumArtUrl?: string,       // 來自 SongMetadata
    matchConfidence?: string    // 來自 SongMetadata
  }
]
```

歌詞資料不在頁面初始載入時擷取，由歌詞面板開啟時延遲載入以避免首頁載入過重。

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
| normalizedArtist | string | 是 | 正規化的原唱者名稱（查詢鍵） |
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

> **注意**：LyricLine 不儲存於靜態檔案，而是前端從 `SongLyrics.syncedLyrics` 的 LRC 文字動態解析。

### 4.4 靜態資料端點與 CLI 指令（Static Data Endpoints & CLI Commands）

#### 靜態檔案路徑

前端讀取的靜態 JSON 檔案，部署於 GitHub Pages：

| 路徑 | 內容 | 載入時機 |
|------|------|----------|
| `/data/metadata/song-metadata.json` | `SongMetadata[]` — 專輯封面 URL、匹配信心度、擷取狀態 | 頁面初始載入，與 `songs.json` 同時 fetch |
| `/data/metadata/song-lyrics.json` | `SongLyrics[]` — 同步歌詞與純文字歌詞 | 延遲載入，首次開啟歌詞面板時 fetch |
| `/data/metadata/artist-info.json` | `ArtistInfo[]` — 原唱者圖片 URL | 頁面初始載入 |

#### CLI 指令參考

所有指令皆為 `mizukilens metadata` 子命令群組，寫入 `data/metadata/` 目錄下的 JSON 檔案。

**`metadata fetch`** — 從 Deezer / LRCLIB 擷取後設資料

| 選項 | 說明 |
|------|------|
| `--missing`（預設） | 擷取尚無後設資料的歌曲 |
| `--stale` | 重新擷取 `fetchedAt` 超過 90 天的條目 |
| `--all` | 重新擷取所有歌曲（跳過 `manual`，除非搭配 `--force`） |
| `--song ID` | 擷取指定歌曲 |
| `--force` | 強制覆寫 `manual` 狀態 |
| `--lyrics-only` / `--art-only` | 僅擷取歌詞或封面 |

行為：遵守速率限制（Deezer 8 req/sec、單筆間距 200ms），以 Rich 進度條顯示進度，完成後輸出摘要表格。

**`metadata status`** — 檢視後設資料狀態

| 選項 | 說明 |
|------|------|
| `--detail` | 顯示完整資訊（URL、信心度、擷取時間） |
| `--filter STATUS` | 篩選狀態（`matched` / `no_match` / `error` / `manual` / `pending`） |

行為：以 Rich 表格輸出歌名、原唱者、封面狀態、歌詞狀態、匹配信心度、上次擷取時間。

**`metadata override`** — 手動覆寫

| 選項 | 說明 |
|------|------|
| `SONG_ID` | 目標歌曲 ID（必填） |
| `--album-art-url URL` | 手動封面 URL |
| `--lyrics FILE` | 手動歌詞檔案（LRC 或純文字） |

行為：標記 `fetchStatus: 'manual'`，`matchConfidence: 'manual'`。

**`metadata clear`** — 清除後設資料

| 選項 | 說明 |
|------|------|
| `SONG_ID` | 目標歌曲 ID（必填，除非搭配 `--all`） |
| `--all` | 清除所有後設資料 |
| `--force` | 跳過確認提示 |

行為：移除 SongMetadata 與 SongLyrics 條目，恢復為可重新擷取狀態。

### 4.5 Constraints

| 約束 | 說明 |
|------|------|
| 離線優先 | 粉絲端完全從靜態 JSON 檔案讀取，不直接存取 Deezer 或 LRCLIB |
| 無執行時寫入 | 部署後為純靜態站，所有資料變更必須透過 CLI → commit → deploy 流程 |
| 部署延遲 | 後設資料更新需經 commit + push + GitHub Pages deploy 後粉絲端才可見 |
| 優雅降級 | 任何後設資料缺失或錯誤不影響核心功能（歌曲瀏覽、播放、播放清單） |
| J-POP 覆蓋缺口 | 部分獨立曲目可能在 Deezer 或 LRCLIB 中找不到；系統設計已預期此情況 |
| 不自動覆寫策展人資料 | 外部 API 回傳的歌名/原唱者不覆寫 Song 實體的 `title` / `originalArtist`，僅儲存於 SongMetadata 供參考 |
| 速率限制遵守 | Deezer API 無官方速率限制文件，以保守的 8 req/sec 執行批量操作 |
