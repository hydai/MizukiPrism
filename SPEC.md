# MizukiPrism 規格書

## 1. Intent

### 1.1 Purpose

MizukiPrism 讓 Mizuki 的粉絲能快速瀏覽、搜尋並播放她在歌回直播中演唱過的所有歌曲，透過嵌入 YouTube VOD 的方式提供類似 Spotify 的音樂探索體驗。

### 1.2 Users

| 角色 | 描述 | 核心任務 |
|------|------|----------|
| 粉絲（Fan） | Mizuki 的觀眾，想回味或發現她唱過的歌 | 瀏覽歌曲目錄、搜尋特定歌曲、播放特定版本、建立與管理播放清單 |
| 策展人（Curator） | 負責維護歌曲資料的小型管理團隊 | 新增歌曲與版本資料、編輯後設資料、管理 YouTube 連結與時間戳 |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 歌曲發現速度 | 粉絲能在 30 秒內找到 Mizuki 唱過的任何一首歌 |
| 版本瀏覽 | 粉絲能看到同一首歌的所有演唱版本並選擇偏好版本 |
| 播放體驗 | 粉絲能連續播放多首歌曲，無需手動切換 YouTube 影片 |
| 個人化 | 粉絲能建立自己的播放清單方便日後重複聆聽 |
| 資料維護效率 | 策展人能在 2 分鐘內完成一首歌曲版本的資料登錄 |

### 1.4 Success Criteria

- [ ] 歌曲目錄可瀏覽且可搜尋，支援歌名、原唱者、直播日期篩選
- [ ] 每首歌曲顯示所有演唱版本，每個版本可獨立播放
- [ ] YouTube 嵌入播放器能從正確時間戳開始播放
- [ ] 粉絲可建立播放清單，播放清單支援連續播放
- [ ] 播放清單存於 localStorage，無需登入即可使用全部功能
- [ ] 策展人可透過管理介面新增、編輯、刪除歌曲與版本資料
- [ ] UI 語言為繁體中文

### 1.5 Non-goals

- **非通用 VTuber 平台**：僅服務 Mizuki 的歌回內容，不支援其他 VTuber
- **非直播平台**：不提供即時串流功能，僅播放既有 VOD
- **非自動化抓取**：歌曲資料由策展人手動維護，不自動從 YouTube 擷取
- **非音樂下載器**：不提供任何下載功能，所有播放透過 YouTube 嵌入
- **非社群互動平台**：不提供留言、評分或社群功能
- **非跨裝置同步**：當前範圍不包含使用者帳號與跨裝置同步，播放清單僅存於瀏覽器 localStorage

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| 歌曲目錄（Song Catalog） | 列出所有 Mizuki 演唱過的歌曲，含歌名、原唱者、分類標籤 | 粉絲 |
| 版本追蹤（Version Tracking） | 每首歌記錄所有演唱版本，含直播日期、YouTube 連結、時間戳 | 粉絲 |
| 嵌入播放（YouTube Playback） | 透過 YouTube IFrame API 嵌入播放，自動跳轉至正確時間戳 | 粉絲 |
| 搜尋與篩選（Search & Filter） | 依歌名、原唱者、直播日期、標籤搜尋或篩選歌曲 | 粉絲 |
| 播放清單（Playlist） | 建立、編輯、刪除個人播放清單；支援連續播放與順序調整。資料存於瀏覽器 localStorage | 粉絲 |
| 策展管理（Curator Management） | 新增／編輯／刪除歌曲、版本、直播資料的管理介面 | 策展人 |
| 雙模式瀏覽（Dual View Mode） | 在平面時間序列表（依日期排列所有演出）與依歌曲分組檢視之間切換 | 粉絲 |
| 直播主頁面（Streamer Profile） | 頁面頂部顯示 Mizuki 的頭像、簡介、社群連結、歌曲總數 | 粉絲 |
| YouTube 直連（Open in YouTube） | 每個演出版本提供直接連結，可在 YouTube 上以正確時間戳開啟 | 粉絲 |
| 外部追蹤按鈕（External Follow） | 點擊後在新分頁開啟 Mizuki 的 YouTube 頻道以進行訂閱（非站內追蹤） | 粉絲 |

### 2.2 User Journeys

#### Journey 1：粉絲探索歌曲

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想知道 Mizuki 有沒有唱過某首歌 |
| 行動（Action） | 在搜尋欄輸入歌名或原唱者名稱 |
| 結果（Outcome） | 系統顯示匹配的歌曲列表；點擊歌曲後展開所有演唱版本，每個版本顯示直播日期與連結 |

#### Journey 2：粉絲播放與連續聆聽

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲找到想聽的歌曲版本，並想連續播放多首 |
| 行動（Action） | 點擊版本的播放按鈕；在播放過程中可將其他版本加入播放佇列 |
| 結果（Outcome） | YouTube 嵌入播放器從正確時間戳開始播放；播放結束後自動播放佇列中的下一首 |

#### Journey 3：粉絲建立播放清單

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想把喜歡的版本整理成一個播放清單，方便日後重複聆聽 |
| 行動（Action） | 建立新播放清單、命名、從歌曲目錄中將版本加入播放清單 |
| 結果（Outcome） | 播放清單儲存完成（存於 localStorage），可一鍵啟動連續播放 |

#### Journey 4：策展人登錄新歌曲

| 階段 | 內容 |
|------|------|
| 情境（Context） | Mizuki 完成了一場歌回直播，策展人需要將新演唱的歌曲資料加入系統 |
| 行動（Action） | 輸入密鑰進入管理介面 → 新增直播場次（YouTube 連結、日期）→ 逐首新增歌曲版本（歌名、原唱者、時間戳）；若歌曲已存在則直接新增版本 |
| 結果（Outcome） | 新版本出現在粉絲端的歌曲目錄中（粉絲需重新整理頁面以取得最新資料） |

#### Journey 5：粉絲依時間瀏覽

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想看 Mizuki 最近唱了什麼歌 |
| 行動（Action） | 切換至時間序列檢視，看到依日期降冪排列的所有演出平面列表 |
| 結果（Outcome） | 粉絲可快速瀏覽近期演出並直接播放感興趣的版本 |

## 3. Behavior

### 3.1 Feature Behaviors

#### 3.1.1 歌曲目錄（Song Catalog）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 目錄有歌曲 | 開啟首頁 | 顯示所有歌曲列表，按歌名筆畫排序，每首顯示歌名、原唱者、版本數量 |
| 目錄為空 | 開啟首頁 | 顯示空狀態提示：「目前尚無歌曲資料」 |
| 歌曲有多個版本 | 點擊歌曲卡片 | 展開版本列表，每個版本顯示直播日期、直播標題；按日期降冪排列（最新在前） |
| 歌曲只有一個版本 | 點擊歌曲卡片 | 展開版本列表，顯示唯一版本 |
| 任意 | 切換至時間序列檢視 | 顯示所有演出的平面列表，按日期降冪排列（最新在前），每列顯示歌名、原唱者、直播標題、日期、演出備註 |
| 任意 | 切換至歌曲分組檢視 | 歌曲列表按歌名排列，每首顯示版本數量；點擊展開可查看各版本 |
| 首次載入 | 開啟首頁 | 預設顯示時間序列檢視 |

#### 3.1.2 搜尋與篩選（Search & Filter）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 輸入搜尋關鍵字 | 客戶端即時篩選歌曲列表（所有歌曲資料已載入至前端，JavaScript 過濾，無伺服器往返）；以不區分大小寫的子字串匹配搜尋歌名與原唱者；最少輸入 1 字元即觸發，即時顯示結果 |
| 任意 | 選擇篩選條件（原唱者、日期範圍、標籤） | 歌曲列表僅顯示符合所有篩選條件的結果（AND 邏輯） |
| 搜尋 + 篩選同時啟用 | — | 兩者取交集 |
| 無匹配結果 | 搜尋或篩選 | 顯示「找不到符合條件的歌曲」並建議清除篩選條件 |
| 搜尋欄有內容 | 清除搜尋欄 | 恢復為完整歌曲列表（保留其他篩選條件） |
| 任一檢視模式 | 搜尋或篩選 | 搜尋與篩選在兩種檢視模式下均生效：歌曲分組檢視中篩選歌曲條目，時間序列檢視中篩選演出條目。標籤篩選依據版本所屬歌曲的標籤進行匹配（標籤定義於歌曲層級，非版本層級） |

#### 3.1.3 嵌入播放（YouTube Playback）

播放器採用雙層模式：底部面板（迷你播放器）與展開模態框（完整「正在播放」檢視）。

| 狀態 | 操作 | 結果 |
|------|------|------|
| 無播放中 | 點擊版本的播放按鈕 | 頁面底部出現迷你播放器面板，顯示歌名、原唱者、播放/暫停、上一首/下一首、進度條；YouTube 嵌入影片從該版本的開始時間戳播放 |
| 迷你播放器顯示中 | 瀏覽其他頁面 | 迷你播放器持續顯示於頁面底部，播放不中斷 |
| 迷你播放器顯示中 | 點擊迷你播放器 | 展開為完整「正在播放」模態框，顯示 YouTube 嵌入影片畫面 |
| 模態框展開中 | 點擊收合按鈕 | 回到迷你播放器，播放不中斷 |
| 有播放中 | 點擊另一個版本的播放按鈕 | 播放器切換至新版本，從其時間戳開始播放 |
| 播放中 | 歌曲播放至結束時間戳 | 若播放佇列有下一首，自動播放；若無，播放器停止並顯示「播放完畢」 |
| 播放中 | 點擊暫停 | 暫停播放，按鈕切換為繼續 |
| 暫停中 | 點擊繼續 | 從暫停位置繼續播放 |
| 播放中 | 點擊下一首 | 跳至佇列中的下一首；若佇列為空，停止播放 |
| 播放中 | 點擊上一首 | 若已播放超過 3 秒，回到目前歌曲開始處；否則跳至佇列中的上一首 |

#### 3.1.4 播放佇列（Play Queue）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 將版本加入佇列 | 版本加至佇列末端；顯示確認提示「已加入播放佇列」 |
| 佇列有項目 | 將相同版本再次加入 | 允許重複加入（佇列中出現兩次） |
| 佇列有項目 | 拖曳調整順序 | 佇列順序即時更新 |
| 佇列有項目 | 點擊移除 | 該項目從佇列中移除 |
| 佇列為空 | 開啟佇列面板 | 顯示「播放佇列為空」 |

#### 3.1.5 播放清單（Playlist）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 建立新播放清單 | 輸入名稱後建立，名稱不可為空 |
| 播放清單存在 | 將版本加入播放清單 | 版本加至播放清單末端 |
| 播放清單存在 | 將已存在的版本再次加入 | 阻止操作，顯示「此版本已在播放清單中」 |
| 播放清單存在 | 拖曳調整版本順序 | 順序即時更新 |
| 播放清單存在 | 移除版本 | 版本從播放清單移除 |
| 播放清單存在 | 重新命名 | 名稱更新，不可為空 |
| 播放清單存在 | 刪除播放清單 | 顯示確認對話框，確認後刪除 |
| 播放清單存在 | 播放 | 將播放清單所有版本載入佇列並從第一首開始播放 |
| 播放清單中的版本被策展人從系統刪除 | 開啟播放清單 | 標記已刪除的版本為「此版本已無法播放」，不自動移除 |
| 播放清單連續播放中遇到已刪除版本 | 自動跳至下一首 | 跳過已刪除版本並顯示短暫提示「已跳過無法播放的版本」；若播放清單中所有剩餘版本皆已刪除，停止播放並顯示「播放完畢」 |

> **儲存機制**：所有播放清單資料存於瀏覽器 localStorage。清除瀏覽器資料將導致播放清單遺失。

#### 3.1.6 策展管理（Curator Management）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 策展人已驗證 | 新增直播場次 | 輸入 YouTube 影片 URL、直播日期、標題；系統驗證 URL 格式（接受 `youtube.com/watch?v=ID`、`youtu.be/ID`、`youtube.com/live/ID` 三種格式，儲存時統一正規化為 `youtube.com/watch?v=ID`）；系統檢查正規化後的 URL 是否重複 |
| 直播場次存在 | 新增歌曲版本 | 輸入歌名、原唱者、開始時間戳、結束時間戳（選填）、標籤（選填）；若歌名已存在於目錄，自動關聯至該歌曲 |
| 歌名不存在於目錄 | 新增歌曲版本 | 自動建立新歌曲條目並關聯此版本 |
| 版本存在 | 編輯版本資料 | 可修改所有欄位，儲存後策展人端立即反映；粉絲需重新整理頁面方可看到更新 |
| 版本存在 | 刪除版本 | 顯示確認對話框並警告「此版本可能存在於粉絲的播放清單中」；確認後刪除 |
| 歌曲的最後一個版本被刪除 | — | 歌曲條目保留（版本數顯示為 0），不自動刪除歌曲 |
| 策展人已驗證 | 編輯歌曲後設資料 | 可修改歌名、原唱者、標籤；變更套用至歌曲條目，版本資料不受影響 |
| 策展人已驗證 | 編輯歌曲後設資料導致 name + artist 與既有歌曲重複 | 表單驗證阻止儲存，顯示「已存在相同歌名與原唱者的歌曲」 |

> **策展人驗證**：策展管理介面透過簡易共用密鑰（shared secret）保護。策展人在進入管理頁面時輸入密鑰，驗證成功後該瀏覽器工作階段內無需重複輸入。密鑰由環境變數或設定檔提供，不屬於使用者帳號系統。

#### 3.1.7 直播主頁面（Streamer Profile）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 開啟首頁 | 頁面頂部顯示直播主資訊區：頭像、名稱、簡介、社群連結（YouTube、Twitter）、歌曲總數 |
| 任意 | 點擊 YouTube 連結 | 在新分頁開啟 Mizuki 的 YouTube 頻道 |
| 任意 | 點擊追蹤按鈕 | 在新分頁開啟 Mizuki 的 YouTube 頻道訂閱頁面 |

#### 3.1.8 YouTube 直連（Open in YouTube）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 點擊演出版本的「在 YouTube 開啟」連結 | 在新分頁開啟 `youtube.com/watch?v={videoId}&t={timestamp}s` |

### 3.2 Error Scenarios

| 功能範圍 | 錯誤情境 | 系統行為 |
|----------|----------|----------|
| 播放 | YouTube 影片已被刪除或設為私人 | 播放器顯示「此影片已無法播放」；歌曲版本保留在目錄中但播放按鈕置灰 |
| 播放 | YouTube IFrame API 載入失敗 | 顯示錯誤訊息「播放器載入失敗，請重新整理頁面」；歌曲目錄與播放清單功能不受影響 |
| 播放 | 時間戳超出影片長度 | 播放器從影片開頭播放，並顯示提示「時間戳可能有誤」 |
| 歌曲目錄 | 歌曲資料 API 載入失敗（網路錯誤或伺服器錯誤） | 顯示全頁錯誤訊息「無法載入歌曲資料，請檢查網路連線後重新整理頁面」，提供重新整理按鈕 |
| 搜尋與篩選 | 搜尋或篩選結果為空 | 顯示「找不到符合條件的歌曲」並建議清除篩選條件（已於 3.1.2 定義） |
| 播放清單 | localStorage 儲存失敗（容量超過約 5MB） | 儲存播放清單時顯示「本機儲存空間不足，請刪除部分播放清單後再試」 |
| 播放清單 | 瀏覽器不支援 localStorage | 首次操作播放清單功能時顯示「您的瀏覽器不支援本機儲存，播放清單功能無法使用」；歌曲瀏覽與播放功能不受影響 |
| 策展管理 | 策展人輸入的 YouTube URL 格式無效 | 表單驗證阻止提交，顯示「請輸入有效的 YouTube URL」 |
| 策展管理 | 策展人輸入的時間戳格式無效 | 表單驗證阻止提交，顯示「請輸入有效的時間戳格式（如 1:23:45 或 01:23:45）」 |
| 策展管理 | 策展人新增的直播場次 YouTube URL 已存在 | 表單驗證阻止提交，顯示「此 YouTube URL 已存在於直播場次中」 |
| 策展管理 | 策展人編輯歌曲後設資料導致 name + artist 與既有歌曲重複 | 表單驗證阻止儲存，顯示「已存在相同歌名與原唱者的歌曲」 |
| 策展管理 | 策展人驗證失敗（密鑰錯誤） | 顯示「驗證失敗，請確認密鑰是否正確」，不透露密鑰相關資訊 |
| 策展管理 | 未驗證存取策展管理頁面 | 導向密鑰輸入頁面 |

### 3.3 System Boundary

| 類型 | MizukiPrism 控制 | MizukiPrism 依賴（外部） |
|------|------------------|--------------------------|
| 責任 | 歌曲與版本資料的儲存、搜尋、播放清單管理（localStorage）、策展人驗證 | 不負責影片託管、影片可用性、影片內容 |
| 互動 | 提供歌曲 CRUD API（策展人）、前端 UI、localStorage 播放清單操作（粉絲） | 輸入：YouTube IFrame Player API（嵌入播放）；Google Fonts CDN（DM Sans 字型） |
| 控制 | 歌曲資料庫 schema、播放清單資料結構、搜尋邏輯、UI 呈現 | YouTube 影片可用性、YouTube API 速率限制、CDN 可用性 |

### 3.4 Presenter

設計層規範，涵蓋頁面佈局、元件庫、設計代幣與響應式行為。

> **設計參照**：視覺設計的權威來源為 Pencil 設計檔 `~/Library/CloudStorage/Dropbox/PencilDesign/MizukiPrism`。桌面版為畫框 "Spotify - Mizuki Music"（1440×900），行動裝置版為畫框 "Spotify Mobile - Mizuki"（390×844）。以下各小節描述該設計檔中的佈局決策與元件結構。

#### 3.4.1 整體佈局架構（Overall Layout）

根節點為垂直堆疊，佔滿整個視窗：

```
┌──────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────┐ │
│ │          │ │                             │ │
│ │ Sidebar  │ │       MainContent           │ │
│ │ (260px)  │ │   (fill, glass card)        │ │
│ │          │ │                             │ │
│ └──────────┘ └─────────────────────────────┘ │
│                  BodyRow (horizontal)         │
├──────────────────────────────────────────────┤
│            NowPlayingBar (80px)              │
└──────────────────────────────────────────────┘
```

- **BodyRow**（水平排列）：Sidebar（固定 260px）+ MainContent（填滿剩餘空間，圓角毛玻璃卡片，圓角 `radius-3xl`）
- **NowPlayingBar**：固定 80px 高度，黏著於頁面底部

#### 3.4.2 側邊欄（Sidebar）

寬度 260px，垂直排列，填充 `bg-surface-frosted`，右側邊框 `border-glass`。

| 區域 | 內容 | 說明 |
|------|------|------|
| Logo 區 | 品牌圖示（disc-3）+ "MizukiPlay" 文字 | 頂部品牌識別（"MizukiPlay" 為使用者介面品牌名稱，"MizukiPrism" 為專案代號） |
| 搜尋框 | SearchBox 元件 | 關鍵字搜尋輸入 |
| DISCOVER 區段 | SectionHeader + 導航項目（Home 預設為啟用狀態） | 主要導航，使用 NavItem/Active 與 NavItem/Default 元件 |
| YOUR LIBRARY 區段 | SectionHeader + Liked Songs、Recently Played、使用者播放清單 | 個人化清單導航 |
| 使用者頁尾 | 頭像（漸層橢圓）+ 使用者名稱 + 狀態標籤 | 底部使用者資訊，漸層邊框與毛玻璃背景 |

#### 3.4.3 主內容區（Main Content）

填充 `bg-surface-glass`，圓角 `radius-3xl`，邊框 `border-glass`，內容溢出裁切。垂直堆疊三個子區域：

**1. Hero Section（高度 280px）**

- 左側：直播主頭像（180×180，圓角 `radius-xl`，外陰影，邊框 `border-glass`）
- 右側（垂直堆疊）：
  - VerifiedBadge 元件
  - 直播主名稱（字級 `font-size-3xl` 附近，字重 900）
  - 描述文字（歌曲數量、聽眾數等統計）
  - 統計列：Followers 數字 + Rank 排名
- 底部漸層遮罩（白色漸透明），底部邊框 `border-glass`

**2. Action Bar**

水平排列，填充 `bg-overlay`，上下邊框 `border-glass`：

- PlayButton 元件（圓形漸層播放按鈕）
- GradientButton 元件（「播放全部」）
- OutlineButton 元件（次要動作按鈕）
- 彈性空白區
- 標籤篩選列：TagItem/Active（已選取）與 TagItem/Default（未選取）元件組成

**3. Song Table**

垂直排列，填滿剩餘高度：

- **表頭列**（SongTableHeader 元件）：

| 欄位 | 寬度 | 內容 |
|------|------|------|
| # | 32px | 序號 |
| 標題 | fill | 歌名 + 原唱者（附 NoteBadge 元件標註演出備註） |
| 出處直播 | fill | 直播標題 |
| 日期 | 100px | 演出日期 |
| 時長 | 60px | 時鐘圖示（表頭）/ 時間文字（資料列） |

- **資料列**（SongRow 元件）：每列圓角 `radius-lg`，hover/播放中列以淡粉色背景標示

#### 3.4.4 正在播放列（Now Playing Bar）

高度 80px，水平排列三欄，填充 `bg-surface-frosted`，頂部邊框 `border-glass`：

| 欄位 | 寬度 | 內容 |
|------|------|------|
| 左欄 | 280px | 專輯封面縮圖（48×48，圓角 `radius-sm`）+ 歌名 + 原唱者 + 愛心圖示 |
| 中欄 | fill | 傳輸控制列（shuffle、上一首、播放/暫停、下一首、repeat）+ 進度條（漸層填充 + 拖曳圓點）+ 時間標籤 |
| 右欄 | 200px | 佇列圖示 + 裝置圖示 + 音量滑桿 |

- 傳輸控制使用 PlayButton 元件（縮小版 40×40）
- 進度條使用粉→藍漸層填充，圓點帶有 `accent-pink-light` 邊框

#### 3.4.5 元件庫（Component Library）

設計中定義 15 個可重用元件：

| 元件 | 用途 | 使用位置 |
|------|------|----------|
| NavItem/Active | 高亮側邊欄連結（漸層背景） | 側邊欄當前頁面 |
| NavItem/Default | 一般側邊欄連結 | 側邊欄其他頁面 |
| SearchBox | 關鍵字搜尋輸入框 | 側邊欄 |
| TagItem/Active | 已選取的篩選標籤 | Action Bar |
| TagItem/Default | 未選取的篩選標籤 | Action Bar |
| NoteBadge | 演出備註標示（如「Playing」） | 歌曲列表資料列 |
| SongRow | 單首歌曲資料列 | 歌曲列表 |
| SocialButton | 外部連結按鈕 | Hero Section |
| PlayButton | 圓形播放觸發按鈕（漸層背景） | Action Bar、Now Playing Bar |
| OutlineButton | 次要動作按鈕（外框樣式） | Action Bar |
| VerifiedBadge | 直播主認證標籤 | Hero Section |
| SongTableHeader | 歌曲列表欄位標頭 | 歌曲列表 |
| SectionHeader | 側邊欄區段標題 | 側邊欄 |
| GradientButton | 主要動作按鈕（漸層背景） | Action Bar |
| GlassCard | 毛玻璃容器卡片 | 通用容器 |

#### 3.4.6 設計代幣（Design Tokens）

**色彩（Colors）**

| 類別 | Token 名稱 | 值 |
|------|-----------|-----|
| 強調色 | `accent-pink` | #EC4899 |
| 強調色 | `accent-pink-dark` | #DB2777 |
| 強調色 | `accent-pink-light` | #F472B6 |
| 強調色 | `accent-blue` | #3B82F6 |
| 強調色 | `accent-blue-light` | #60A5FA |
| 強調色 | `accent-purple` | #A855F7 |
| 頁面背景 | `bg-page-start` | #FFF0F5 |
| 頁面背景 | `bg-page-mid` | #F0F8FF |
| 頁面背景 | `bg-page-end` | #E6E6FA |
| 表面 | `bg-surface` | #FFFFFF |
| 表面 | `bg-surface-frosted` | #FFFFFF99 |
| 表面 | `bg-surface-glass` | #FFFFFF66 |
| 表面 | `bg-surface-muted` | #FFFFFF80 |
| 覆蓋層 | `bg-overlay` | #FFFFFFCC |
| 強調背景 | `bg-accent-pink` | #FDF2F8 |
| 強調背景 | `bg-accent-pink-muted` | #FCE7F3 |
| 強調背景 | `bg-accent-blue` | #EFF6FF |
| 強調背景 | `bg-accent-blue-muted` | #DBEAFE |
| 文字 | `text-primary` | #1E293B |
| 文字 | `text-secondary` | #64748B |
| 文字 | `text-tertiary` | #94A3B8 |
| 文字 | `text-muted` | #CBD5E1 |
| 文字 | `text-on-accent` | #FFFFFF |
| 邊框 | `border-default` | #E2E8F0 |
| 邊框 | `border-glass` | #FFFFFF66 |
| 邊框 | `border-table` | #E2E8F040 |
| 邊框 | `border-accent-pink` | #FBCFE8 |
| 邊框 | `border-accent-blue` | #BFDBFE |

**字型（Typography）**

| Token | 值 |
|-------|-----|
| `font-primary` | DM Sans |
| `font-size-xs` | 10px |
| `font-size-sm` | 11px |
| `font-size-base` | 13px |
| `font-size-md` | 14px |
| `font-size-lg` | 15px |
| `font-size-xl` | 20px |
| `font-size-2xl` | 32px |
| `font-size-3xl` | 48px |
| `font-size-display` | 64px |

**間距（Spacing）**

| Token | 值 |
|-------|-----|
| `space-1` | 2px |
| `space-2` | 4px |
| `space-3` | 8px |
| `space-4` | 12px |
| `space-5` | 16px |
| `space-6` | 24px |
| `space-7` | 32px |
| `space-8` | 40px |

**圓角（Border Radii）**

| Token | 值 |
|-------|-----|
| `radius-xs` | 6px |
| `radius-sm` | 8px |
| `radius-md` | 10px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-2xl` | 20px |
| `radius-3xl` | 24px |
| `radius-pill` | 28px |
| `radius-circle` | 9999px |

**圖示尺寸（Icon Sizes）**

| Token | 值 |
|-------|-----|
| `icon-sm` | 14px |
| `icon-md` | 16px |
| `icon-lg` | 20px |
| `icon-xl` | 28px |

#### 3.4.7 響應式行為（Responsive Behavior）

| 元素 | 桌面（≥1024px） | 行動裝置（<1024px） |
|------|----------------|---------------------|
| 導航 | 側邊欄（260px） | 底部導航列（BottomNav, 64px） |
| 搜尋 | 側邊欄搜尋框 | 底部導航 Search 分頁 |
| 頂部 | — | TopBar（返回、標題、更多） |
| Hero 區 | 水平排列（頭像左、資訊右） | 垂直排列（頭像上、資訊下，置中） |
| Action Bar | 水平排列，含標籤篩選 | 單獨列 + 標籤橫向捲動列 |
| 歌曲列表 | 全欄位（#、標題、出處直播、日期、時長） | 精簡欄位（#、標題+原唱者、時長） |
| Now Playing | 底部三欄列（80px） | MiniPlayer + BottomNav 堆疊 |
| 播放清單 | 側邊欄 YOUR LIBRARY 區段 | 底部導航 Library 分頁 |

> 行動裝置佈局的完整設計規範見 §3.4.9。

#### 3.4.8 視覺主題（Visual Theme）

整體視覺採用 Glassmorphism（毛玻璃風格）：

- **頁面背景**：對角線漸層（粉 `bg-page-start` → 藍 `bg-page-mid` → 薰衣草 `bg-page-end`），角度 135°
- **表面層**：半透明白色毛玻璃效果（`bg-surface-frosted`、`bg-surface-glass`），搭配 `border-glass` 玻璃邊框
- **強調漸層**：粉→藍（`accent-pink-light` → `accent-blue-light`），用於 PlayButton、NavItem/Active、GradientButton、進度條等元件
- **陰影**：關鍵元素（直播主頭像）使用淡外陰影增加層次感

#### 3.4.9 行動裝置佈局（Mobile Layout）

以下規範描述行動裝置斷點（<1024px）下的佈局，以 390×844 參考畫框設計。此為桌面佈局的響應式變體，不引入新功能行為。

##### 3.4.9.1 整體結構（Overall Mobile Layout）

```
┌──────────────────────────┐
│       TopBar (56px)      │
├──────────────────────────┤
│                          │
│   ScrollArea (fill)      │
│   ├ MobileHero           │
│   ├ MobileActionBar      │
│   ├ MobileTagScroll      │
│   └ MobileSongList       │
│                          │
├──────────────────────────┤
│   MiniPlayer             │
├──────────────────────────┤
│   BottomNav (64px)       │
└──────────────────────────┘
```

- **根框架**：垂直排列，漸層背景（同桌面版）
- **ScrollArea**：垂直排列，溢出裁切，填滿 TopBar 與底部堆疊之間的剩餘高度
- **底部堆疊**：MiniPlayer + BottomNav 固定於底部

##### 3.4.9.2 TopBar（56px）

水平排列，垂直置中，padding 0/20。

| 位置 | 內容 | 規格 |
|------|------|------|
| 左 | 返回按鈕（chevron-left 圖示） | 24px |
| 中 | "Artist" 標籤 | fontSize 14, fontWeight 600, `text-secondary` |
| 右 | 更多按鈕（ellipsis 圖示） | 24px |

##### 3.4.9.3 MobileHero

垂直排列，padding 16/24/24/24，所有內容水平置中。

| 元素 | 規格 |
|------|------|
| 頭像 | 160×160，cornerRadius 80（圓形），漸層邊框（粉→藍，3px），外陰影 |
| 認證徽章 | sparkles 圖示 + "Verified Artist" 文字（`accent-pink` 文字色，`#FDF2F8` 背景） |
| 名稱 | fontSize 36, fontWeight 900, letterSpacing -0.5 |
| 描述 | "Virtual Singer & Streamer · {songCount} Songs"（fontSize 13，置中） |
| 統計列 | "{followerCount} Followers · Rank #{rank}"（rank 使用 `accent-pink` 色） |

##### 3.4.9.4 MobileActionBar

水平排列，padding 0/20，gap 12。

| 元素 | 規格 |
|------|------|
| 播放按鈕 | 48×48 圓形，漸層填充（粉→藍） |
| Shuffle 按鈕 | 漸層填充，cornerRadius `radius-lg`，padding 12/28（視覺預留位置，無新功能） |
| 彈性空白 | fill |
| Follow 按鈕 | 外框樣式，border `#E2E8F0`，cornerRadius 20，padding 8/24 |

##### 3.4.9.5 MobileTagScroll

水平捲動列，padding 12/20，gap 8。

| 狀態 | 規格 |
|------|------|
| 標籤通用 | height 36，cornerRadius 12，padding 0/16 |
| 已選取（Active） | fill `#FDF2F8`，stroke `#FBCFE8`（1px） |
| 未選取（Default） | 無填充，無邊框 |

##### 3.4.9.6 MobileSongList

垂直排列，gap 2，padding 0/8。

**每列規格**：cornerRadius 12，padding 12/16，gap 16，滿寬。播放中列以 `#FCE7F320`（淡粉色調）填充。

| 元素 | 規格 |
|------|------|
| 序號 | width 32，fontSize 14；播放中列使用 `accent-pink` 色 |
| 標題區塊 | 垂直排列，gap 2，填滿剩餘空間 |
| — 歌名 | fontSize 15，fontWeight 600；播放中列使用 `accent-pink-dark` |
| — 原唱者 | fontSize 13，`text-secondary` |
| 出處直播欄 | **行動裝置隱藏**（enabled: false） |
| 日期欄 | **行動裝置隱藏**（enabled: false） |
| 時長 | width 60，靠右對齊，fontSize 13 |

##### 3.4.9.7 MiniPlayer（行動裝置）

堆疊於 BottomNav 上方，滿寬。

- **外觀**：上方圓角（cornerRadius 16/16/0/0），毛玻璃填充，上方與側邊邊框
- **進度條**：height 3，`#E2E8F0` 背景，漸層填充（粉→藍），上方圓角

**內容列**（padding 10/16，gap 12）：

| 元素 | 規格 |
|------|------|
| 封面縮圖 | 40×40，cornerRadius 8 |
| 歌曲資訊 | 垂直排列，gap 2，填滿剩餘空間：歌名（fontSize 13，fontWeight 600）+ 原唱者（fontSize 11） |
| 愛心圖示 | 20px，`accent-pink`（視覺預留位置，無新功能） |
| 播放/暫停圖示 | 24px，`text-primary` |

##### 3.4.9.8 BottomNav

高度 64px，padding 8/0/16/0，毛玻璃填充，頂部邊框。四個項目均分排列（space_around）。

| 項目 | 圖示 | 說明 |
|------|------|------|
| Home | house | 啟用狀態：`accent-pink` 色，fontWeight 700 |
| Search | search | — |
| Library | list-music | — |
| Profile | 漸層橢圓頭像 | — |

- 每項：圖示 22px + 標籤 fontSize 10，gap 4，垂直堆疊
- 未啟用項目：`text-tertiary`，fontWeight 500
- **備註**：底部導航提供與桌面側邊欄相同的導航功能；具體路由為實作細節

### 3.5 Assumptions & Constraints

| 假設 | 說明 |
|------|------|
| JavaScript 必須啟用 | 網站為 SPA，所有功能依賴 JavaScript 執行 |
| localStorage 支援 | 播放清單功能需要瀏覽器支援 Web Storage API；不支援時優雅降級（見 §3.2 錯誤情境） |
| DM Sans 字型 | 主字型透過 Google Fonts CDN 載入；若 CDN 不可用，降級為系統無襯線字型 |
| 歌曲目錄規模 | 預期歌曲數量在 ~2000 首以內，允許以客戶端篩選實現搜尋功能（全量載入後 JavaScript 過濾） |
| 單分頁播放模型 | 播放佇列為 per-tab，各瀏覽器分頁獨立運作，不跨分頁同步播放狀態 |
| 策展管理非面向用戶認證 | 策展介面由簡易共用密鑰保護（非使用者帳號系統），適用於小型可信任團隊 |
| 即時性定義 | 策展人新增或修改資料後，策展人自身頁面立即反映變更；粉絲端需重新整理頁面方可看到更新（無即時推送機制） |
| 單策展人操作模型 | 系統不處理多位策展人同時編輯的衝突；適用於小型可信任團隊以低頻率輪流操作的情境。後寫入覆蓋先寫入（last-write-wins） |

## 4. Refinement

### 4.1 Terminology

| 術語 | 英文 | 定義 |
|------|------|------|
| 歌曲 | Song | 一首曲目的抽象概念，由歌名與原唱者唯一識別。一首歌曲可對應多個版本。 |
| 版本 | Version | Mizuki 在特定直播場次中演唱某首歌曲的一次演出。版本屬於且僅屬於一首歌曲和一個直播場次。每個版本包含開始時間戳、選填的結束時間戳與選填的演出備註。 |
| 直播場次 | Stream | 一場完整的歌回直播，對應一個 YouTube 影片 URL。一個直播場次包含多個版本。 |
| 播放清單 | Playlist | 粉絲建立的版本有序集合，用於連續播放。一個播放清單不允許包含重複版本。 |
| 播放佇列 | Play Queue | 當前播放工作階段的暫時版本序列，允許重複。關閉頁面即消失。 |
| 標籤 | Tag | 策展人附加在歌曲上的自由格式分類標記（如「動漫」、「J-POP」、「中文歌」），用於篩選。標籤由策展人自行輸入，無預定義詞彙表。 |
| 粉絲 | Fan | 使用 MizukiPrism 瀏覽與播放歌曲的一般使用者。 |
| 策展人 | Curator | 擁有管理權限的使用者，負責維護歌曲、版本與直播場次資料。 |
| 策展人驗證 | Curator Auth | 策展管理介面的簡易存取控制機制。透過共用密鑰（shared secret）驗證，非使用者帳號系統。 |
| 時間戳 | Timestamp | 影片中的時間點，格式為 `H:MM:SS` 或 `HH:MM:SS`，標記版本在影片中的起訖位置。 |
| 演出備註 | Note | 版本上的選填文字標註，描述該次演出的特殊性質（如「清唱版」、「吉他伴奏」）。 |
| 時間軸貢獻者 | Setlist Contributor | 在 YouTube 留言區整理並發布歌曲時間軸的粉絲。其使用者名稱與頻道連結記錄於直播場次資料中，作為該場次歌單的建立者。 |

### 4.2 Patterns

#### 4.2.1 歌曲-版本-直播場次關係

```
Song (1) ←──── (*) Version (*) ────→ (1) Stream
歌曲            版本                   直播場次
```

- 一首歌曲擁有一至多個版本
- 一個直播場次包含一至多個版本
- 版本是歌曲與直播場次的交會點，包含：開始時間戳、結束時間戳（選填）、演出備註（選填）
- 歌名 + 原唱者唯一識別一首歌曲
- YouTube URL 唯一識別一個直播場次

#### 4.2.2 播放清單與播放佇列的區別

| 特性 | 播放清單（Playlist） | 播放佇列（Play Queue） |
|------|----------------------|------------------------|
| 持久性 | 持久儲存（localStorage） | 僅存在於當前瀏覽器工作階段（per-tab） |
| 重複版本 | 不允許 | 允許 |
| 用途 | 長期收藏與整理 | 當次聆聽的即時排列 |
| 建立方式 | 使用者手動建立並命名 | 點擊播放或加入佇列時自動產生 |

#### 4.2.3 播放清單儲存模式

所有播放清單資料儲存於瀏覽器 localStorage，以 JSON 格式序列化。

| 特性 | 說明 |
|------|------|
| 儲存位置 | `localStorage`（瀏覽器本機） |
| 容量限制 | 約 5MB（各瀏覽器略有差異） |
| 持久性 | 瀏覽器資料清除時遺失 |
| 跨裝置 | 不支援（僅限同一瀏覽器） |
| 跨分頁 | 同一瀏覽器的多個分頁共享 localStorage，但播放佇列為 per-tab 獨立 |

#### 4.2.4 策展人工作流程

```
輸入共用密鑰進入管理介面
  └→ 新增直播場次（URL、日期、標題）
       └→ 逐首新增版本
            ├→ 歌名已存在 → 關聯至既有歌曲
            └→ 歌名不存在 → 自動建立新歌曲條目
                 └→ 版本出現在粉絲端（粉絲需重新整理頁面）
```

每次新增版本時，系統根據歌名 + 原唱者查找是否已有對應歌曲：
- 找到 → 新版本歸屬至該歌曲
- 未找到 → 建立新歌曲，版本歸屬至新歌曲

### 4.3 Data Contracts

以下為核心資料實體的結構定義。欄位名稱為邏輯名稱，不指定具體資料庫 schema 或 API 格式。

#### Song（歌曲）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 唯一識別碼 |
| name | string | 是 | 歌曲名稱 |
| artist | string | 是 | 原唱者名稱 |
| tags | string[] | 否 | 分類標籤（策展人自由輸入），空陣列表示無標籤 |

**唯一性約束**：`name` + `artist` 組合唯一。

#### Version（版本）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 唯一識別碼 |
| songId | string | 是 | 所屬歌曲 ID |
| streamId | string | 是 | 所屬直播場次 ID |
| startTimestamp | string | 是 | 開始時間戳（格式 `H:MM:SS` 或 `HH:MM:SS`） |
| endTimestamp | string | 否 | 結束時間戳（格式同上），省略時播放至同一直播場次中下一版本的 `startTimestamp`（依 `startTimestamp` 升冪排列），若為該場次最後一個版本則播放至影片結束 |
| note | string | 否 | 演出備註（如「清唱版」、「吉他伴奏」） |

#### Stream（直播場次）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 唯一識別碼 |
| youtubeUrl | string | 是 | YouTube 影片 URL |
| date | string | 是 | 直播日期（ISO 8601 日期格式，如 `2024-03-15`） |
| title | string | 是 | 直播標題 |
| setlistContributor | string | 否 | 時間軸貢獻者的 YouTube 使用者名稱。該場次的歌單視為由此貢獻者建立的播放清單，標題即為直播標題 |
| setlistContributorUrl | string | 否 | 時間軸貢獻者的 YouTube 頻道 URL |

**唯一性約束**：`youtubeUrl` 唯一。

#### Playlist（播放清單，localStorage）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 唯一識別碼（客戶端生成） |
| name | string | 是 | 播放清單名稱（不可為空字串） |
| versionIds | string[] | 是 | 版本 ID 的有序陣列（不允許重複） |
| createdAt | string | 是 | 建立時間（ISO 8601） |
| updatedAt | string | 是 | 最後修改時間（ISO 8601） |

---

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

> **抓取機制**：使用 `scrapetube.get_channel()` 搭配 `content_type="streams"` 過濾直播內容。若 `content_type` 過濾不可靠，退回 `content_type="videos"` 並結合標題關鍵字篩選。

#### 3.1.3 時間軸擷取（Timestamp Extraction）

擷取流程依優先順序執行三階段嘗試：

```
留言區搜尋 → 找到有效時間軸？
  ├→ 是：解析並儲存，標記來源為 "comment"，記錄留言者資訊為時間軸貢獻者
  └→ 否：描述欄搜尋 → 找到有效時間軸？
        ├→ 是：解析並儲存，標記來源為 "description"（貢獻者留空）
        └→ 否：標記場次為「待處理」(pending)
```

##### 3.1.3.1 留言區時間軸擷取

| 狀態 | 操作 | 結果 |
|------|------|------|
| 場次未擷取 | 執行時間軸擷取 | 使用 `youtube-comment-downloader` 抓取留言，依熱門排序 |
| 留言抓取完成 | — | 掃描所有留言，識別包含 ≥3 個時間戳模式的留言為候選時間軸留言 |
| 找到多個候選留言 | — | 依以下權重排序選取最佳候選：(1) 置頂留言最優先 (2) 按讚數最多 (3) 時間戳數量最多 |
| 選定候選留言 | — | 解析每行的時間戳與歌曲資訊，產生結構化歌曲列表 |
| 選定候選留言 | — | 記錄該留言作者的使用者名稱與頻道 URL 為時間軸貢獻者（setlist contributor） |
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

歌曲資訊中若包含 `/ ` 或 `-` 分隔的兩部分，嘗試拆解為歌名與原唱者（後半部分為原唱者）。例如：

| 原始文字 | 解析歌名 | 解析原唱者 |
|----------|----------|------------|
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
| TUI 場次列表 | 選擇場次 | 展開該場次的歌曲列表，顯示解析來源、時間軸貢獻者、時間戳、歌名、原唱者 |
| 歌曲列表 | 編輯歌名 | 就地編輯歌名文字 |
| 歌曲列表 | 編輯原唱者 | 就地編輯原唱者文字 |
| 歌曲列表 | 編輯時間戳 | 就地編輯開始/結束時間戳，格式驗證即時回饋 |
| 歌曲列表 | 新增歌曲 | 在指定位置插入新的歌曲條目 |
| 歌曲列表 | 刪除歌曲 | 刪除選中的歌曲條目（確認後） |
| 歌曲列表 | 新增演出備註 | 為歌曲版本附加備註文字（如「清唱版」） |
| 歌曲列表 | 編輯貢獻者 | 就地編輯時間軸貢獻者名稱與頻道 URL |
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

> **匯入機制**：匯入目標取決於 MizukiPrism 的資料儲存方式。若 MizukiPrism 使用靜態 JSON 檔案，則直接合併；若使用資料庫，則透過 MizukiPrism 提供的 CLI 或 API 寫入。此介面為 MizukiLens 與 MizukiPrism 的整合點，具體實作依 MizukiPrism 的資料層設計調整。

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
|------|------------------|--------------------------|
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
| 時間軸貢獻者 | Setlist Contributor | 在 YouTube 留言區整理並發布歌曲時間軸的粉絲。其使用者名稱與頻道連結隨場次資料一同記錄與匯出，在 MizukiPrism 中作為該場次歌單的建立者呈現。 |

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
6. 記錄該留言作者的使用者名稱與頻道 URL 為時間軸貢獻者
7. 解析該留言的每一行為 (timestamp, song_info) 對
```

#### 4.2.3 與 MizukiPrism 的資料對應

| MizukiLens 產出 | MizukiPrism 實體 | 對應關係 |
|------------------|------------------|----------|
| 場次（YouTube URL + 日期 + 標題） | Stream | 1:1，以 YouTube URL 為唯一鍵 |
| 時間軸貢獻者（留言者名稱 + 頻道 URL） | Stream.setlistContributor | 隨場次匯出，作為該場次歌單的建立者 |
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
| setlistContributor | string | 否 | 時間軸貢獻者的 YouTube 使用者名稱（來源為留言時記錄，描述欄或手動輸入時為空） |
| setlistContributorUrl | string | 否 | 時間軸貢獻者的 YouTube 頻道 URL |

##### Song

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 由 MizukiLens 生成的唯一 ID |
| name | string | 是 | 歌曲名稱 |
| artist | string | 是 | 原唱者名稱（解析不出時為空字串，策展人需在審核時補齊） |
| tags | string[] | 否 | 分類標籤，預設空陣列（由策展人在審核時或 MizukiPrism 中補充） |

**唯一性約束**：`name` + `artist` 組合唯一。匯出時自動合併同名歌曲。

##### Version

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | string | 是 | 由 MizukiLens 生成的唯一 ID |
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
| contributor_name | TEXT | 時間軸貢獻者的 YouTube 使用者名稱（來源為留言時記錄） |
| contributor_url | TEXT | 時間軸貢獻者的 YouTube 頻道 URL |
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
