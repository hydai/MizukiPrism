# MizukiPrism 認證與跨裝置同步規格書

> 本規格書為 [SPEC.md](./SPEC.md) 的擴充模組，定義 Email OTP 認證與跨裝置播放清單同步功能。取代原有的帳號密碼認證系統。

## 1. Intent

### 1.1 Purpose

為 MizukiPrism 粉絲提供無密碼（Passwordless）認證機制，透過 Email OTP（一次性驗證碼）登入，並實現跨裝置播放清單同步。後端由 Cloudflare Workers + KV + D1 提供，前端維持 GitHub Pages 靜態部署。

### 1.2 Users

| 角色 | 影響 |
|------|------|
| 粉絲（Fan） | 以 Email OTP 登入，播放清單自動同步至雲端，可在多台裝置間共享 |
| 策展人（Curator） | 不受影響。策展人驗證機制（共用密鑰）維持不變 |

### 1.3 Impacts

| 影響指標 | 目標 |
|----------|------|
| 認證體驗 | 粉絲無需記憶密碼，輸入 Email 並輸入 OTP 即可登入 |
| 跨裝置同步 | 登入後播放清單自動在所有裝置間同步 |
| 安全性 | 消除密碼洩漏風險；OTP 有效期 10 分鐘、最多 3 次嘗試 |
| 架構獨立性 | 前端純靜態部署於 GitHub Pages，認證與同步 API 部署於 Cloudflare Workers |

### 1.4 Success Criteria

- [ ] 粉絲可透過 Email 收取 6 位數 OTP 完成首次註冊
- [ ] 粉絲可透過同一 Email 再次登入（無密碼）
- [ ] Session 有效期 30 天（滑動延期），存於 localStorage 並以 `Authorization: Bearer` 標頭傳送
- [ ] 登入後本機播放清單與雲端播放清單自動合併（顯示合併選項對話框）
- [ ] 播放清單變更在離線時暫存，上線後自動同步
- [ ] 移除所有舊認證檔案（`lib/fan-auth.ts`、`data/users.json`、`app/api/auth/fan/`、`app/api/playlists/route.ts`、`lib/user-playlists.ts`、`data/user-playlists/`）
- [ ] Cloudflare Workers subrequest 數量不超過 1000 限制

### 1.5 Non-goals

- **非 OAuth / 社群登入**：不支援 Google、GitHub 等第三方 OAuth 登入
- **非 Email 變更**：使用者無法自行更換已綁定的 Email
- **非帳號自助刪除**：帳號刪除需由管理員手動處理
- **非策展人認證替換**：策展人驗證機制維持現有共用密鑰模式
- **非即時推送同步**：播放清單同步為 pull-based（客戶端主動請求），非即時 WebSocket 推送

## 2. Scope

### 2.1 Feature List

| 功能 | 描述 | 使用者 |
|------|------|--------|
| OTP 註冊（OTP Registration） | 粉絲輸入 Email → 收取 6 位數 OTP → 驗證後建立帳號 | 粉絲 |
| OTP 登入（OTP Login） | 已有帳號的粉絲輸入 Email → 收取 OTP → 驗證後建立 Session | 粉絲 |
| Session 管理（Session Management） | 30 天滑動過期的 Bearer Token，存於 localStorage | 粉絲 |
| 登出（Logout） | 撤銷 Session Token，清除 localStorage 中的 Token | 粉絲 |
| 播放清單雲端同步（Playlist Cloud Sync） | 播放清單變更即時同步至 Cloudflare Workers API | 粉絲 |
| 合併對話框（Merge Dialog） | 登入時若本機與雲端皆有播放清單，顯示三選一對話框（合併 / 使用雲端 / 使用本機） | 粉絲 |
| 離線佇列（Offline Queue） | 離線時暫存播放清單變更，上線後自動同步 | 粉絲 |

### 2.2 User Journeys

#### Journey 1：粉絲首次註冊

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想跨裝置同步播放清單，尚未擁有帳號 |
| 行動（Action） | 點擊登入按鈕 → 輸入 Email → 收到 OTP 郵件 → 輸入 6 位數 OTP |
| 結果（Outcome） | 帳號建立，Session 建立，若本機有播放清單則直接上傳至雲端 |

#### Journey 2：粉絲再次登入

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲在另一台裝置上登入已有帳號 |
| 行動（Action） | 輸入 Email → 收到 OTP → 輸入驗證碼 |
| 結果（Outcome） | Session 建立；若本機與雲端皆有播放清單，顯示合併對話框讓粉絲選擇處理方式 |

#### Journey 3：播放清單跨裝置同步

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲已登入，在裝置 A 新增播放清單後切換至裝置 B |
| 行動（Action） | 在裝置 B 重新整理頁面 |
| 結果（Outcome） | 裝置 B 從雲端拉取最新播放清單，顯示裝置 A 新增的內容 |

#### Journey 4：離線操作

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲在離線狀態下修改播放清單 |
| 行動（Action） | 新增/刪除/重新排列播放清單內容 |
| 結果（Outcome） | 變更暫存於 localStorage；恢復網路後自動同步至雲端 |

#### Journey 5：登出

| 階段 | 內容 |
|------|------|
| 情境（Context） | 粉絲想在當前裝置登出 |
| 行動（Action） | 點擊登出按鈕 |
| 結果（Outcome） | Session 撤銷、localStorage Token 清除；播放清單保留於 localStorage（離線可用），但不再同步 |

## 3. Behavior

### 3.1 Feature Behaviors

#### 3.1.1 OTP 流程（OTP Flow）

**請求 OTP：**

| 狀態 | 操作 | 結果 |
|------|------|------|
| 任意 | 輸入 Email 並點擊「取得驗證碼」 | 系統產生 6 位數 OTP（0-9 數字，含前導零，如 `003847`），透過 Resend 發送至該 Email；前端以 text input 接收（限制輸入為數字），顯示 OTP 輸入框與 10 分鐘倒數計時 |
| 同一 Email 15 分鐘內已請求 3 次 | 再次請求 | 回傳 429，前端顯示「請求過於頻繁，請 15 分鐘後再試」 |
| 任意 | Email 格式無效 | 前端表單驗證阻止送出 |

**驗證 OTP：**

| 狀態 | 操作 | 結果 |
|------|------|------|
| OTP 有效且正確 | 輸入正確 6 位數 | 驗證成功；若 Email 無對應帳號則自動建立；建立 Session 並回傳 Token |
| OTP 有效但不正確 | 輸入錯誤 6 位數 | 錯誤次數 +1，顯示「驗證碼錯誤，剩餘 N 次嘗試機會」 |
| 錯誤次數達 3 次 | 再次輸入 | OTP 作廢，顯示「驗證碼已失效，請重新取得」 |
| OTP 已過期（超過 10 分鐘） | 輸入任何值 | 顯示「驗證碼已過期，請重新取得」 |

**Email 列舉防護（Anti-enumeration）：**

- 無論 Email 是否已註冊，「取得驗證碼」API 一律回傳成功（HTTP 200）
- 不透過 API 回應揭露 Email 是否已存在於系統中
- OTP 發送時 Email 主旨統一為「MizukiPrism 驗證碼」，不區分「註冊」與「登入」
- Email 內容包含：驗證碼（大字體顯示）、有效期限提示（10 分鐘）、「若非本人操作請忽略此郵件」聲明。具體排版與樣式為實作細節

#### 3.1.2 Session 管理（Session Management）

| 特性 | 規格 |
|------|------|
| Token 格式 | 256-bit 不透明隨機字串（`crypto.getRandomValues`），Base64 編碼 |
| 儲存位置（伺服端） | Cloudflare KV，key = `session:{token}`，value = JSON `{ userId, createdAt, expiresAt }` |
| 儲存位置（客戶端） | `localStorage` key = `mizukiprism_auth_token` |
| 有效期 | 30 天滑動延期 |
| 延期節流 | 認證中介層在每次驗證 Session 時檢查 `expiresAt`：若距過期超過 29 天（即距上次延期不足 1 天），跳過 KV 寫入；否則更新 `expiresAt` 並重設 KV TTL 為 30 天。此策略避免每次 API 請求皆觸發 KV 寫入 |
| 傳送方式 | `Authorization: Bearer {token}` HTTP 標頭 |
| 撤銷 | 登出時從 KV 刪除對應 Session 記錄 |
| 客戶端存取格式 | localStorage 中直接儲存 Token 原始字串（非 JSON 包裝），讀取後直接作為 Bearer 值使用 |
| 過期 Token 處理 | 頁面載入時 `FanAuthProvider` 呼叫 `GET /api/auth/me`；若回傳 401，靜默清除 localStorage Token 並切換為未登入狀態，不顯示錯誤訊息。播放清單保留於 localStorage 可離線使用 |

**為何使用 Bearer Token 而非 Cookie：**

- 前端部署於 GitHub Pages（`prism.mizuki.tw`），API 部署於 Cloudflare Workers（不同 origin）
- 跨 origin 的 Cookie 受第三方 Cookie 封鎖政策影響（Safari ITP、Chrome Privacy Sandbox）
- Bearer Token 透過 `Authorization` 標頭發送，不受第三方 Cookie 限制
- 客戶端可完全控制 Token 的儲存與傳送時機

#### 3.1.3 播放清單雲端同步（Playlist Cloud Sync）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 已登入 + 在線 | 新增播放清單 | 本機 localStorage 儲存後，立即 PUT 至 Workers API |
| 已登入 + 在線 | 修改播放清單（重命名、新增/移除版本、重新排序） | 本機 localStorage 更新後，立即 PUT 至 Workers API |
| 已登入 + 在線 | 刪除播放清單 | 本機 localStorage 移除後，立即 DELETE 至 Workers API |
| 已登入 + 離線 | 任何播放清單操作 | 本機 localStorage 正常操作；操作暫存至 `mizukiprism_pending_sync` |
| 已登入 + 離線→在線 | 恢復網路 | 自動將本機完整播放清單 POST 至 Workers API；清除 pending sync |
| 已登入 + 頁面載入 | 開啟/重新整理頁面 | 從 Workers API GET 雲端播放清單，與 localStorage 比對；若不一致則依合併邏輯處理 |
| 未登入 | 任何播放清單操作 | 僅本機 localStorage 操作，行為與現有 SPEC.md §3.1.5 完全相同 |

**登入時合併邏輯：**

| 本機 | 雲端 | 行為 |
|------|------|------|
| 空 | 空 | 無動作 |
| 空 | 有資料 | 直接使用雲端資料 |
| 有資料 | 空 | 直接上傳本機至雲端 |
| 有資料 | 有資料 | 顯示合併對話框，三選一：合併（依 ID 去重，衝突取較新 `updatedAt`）/ 使用雲端 / 使用本機 |

#### 3.1.4 登出（Logout）

| 狀態 | 操作 | 結果 |
|------|------|------|
| 已登入 | 點擊登出 | 呼叫 Workers API 撤銷 Session → 清除 localStorage 中的 Token → UI 切換為未登入狀態；播放清單保留於 localStorage |
| 已登入 + 離線 | 點擊登出 | 清除 localStorage 中的 Token；Session 在 KV 中將自然過期 |

### 3.2 Error Scenarios

| 功能範圍 | 錯誤情境 | 系統行為 |
|----------|----------|----------|
| OTP 請求 | Resend API 發送失敗 | 回傳 HTTP 500，前端顯示「驗證碼發送失敗，請稍後再試」 |
| OTP 請求 | 速率限制觸發（3 次 / Email / 15 分鐘） | 回傳 HTTP 429，前端顯示「請求過於頻繁，請 15 分鐘後再試」 |
| OTP 驗證 | OTP 錯誤 | 回傳 HTTP 400，前端顯示「驗證碼錯誤，剩餘 N 次嘗試機會」 |
| OTP 驗證 | OTP 過期或已用盡嘗試次數 | 回傳 HTTP 400，前端顯示「驗證碼已失效，請重新取得」 |
| Session | Token 無效或過期 | 回傳 HTTP 401，前端清除 Token 並切換為未登入狀態 |
| 播放清單同步 | Workers API 不可達 | 操作暫存至 localStorage pending sync；前端顯示離線指示 |
| 播放清單同步 | 上傳失敗（非 2xx） | 操作保留在 pending sync；下次 online 事件時重試 |
| 播放清單同步 | 衝突（PUT 時雲端 `updatedAt` 較新） | Workers 以 last-write-wins 保留雲端版本，回傳 HTTP 200 並附帶 `conflict: true`；前端顯示「衝突已解決：保留雲端版本的「{name}」」通知 |

### 3.3 System Boundary

| 類型 | MizukiPrism 控制 | MizukiPrism 依賴（外部） |
|------|------------------|--------------------------|
| 責任 | OTP 流程管理、Session 管理、播放清單 CRUD + 同步 | Email 發送（Resend）、KV/D1 儲存（Cloudflare） |
| 互動 | Workers API 端點（認證 + 播放清單） | Resend Send Email API、Cloudflare KV API、Cloudflare D1 SQL |
| 控制 | OTP 生成邏輯、Session 有效期策略、合併衝突解決策略 | Resend 可用性與送達率、Cloudflare 平台可用性 |

### 3.4 API 端點（API Endpoints）

所有端點部署於 Cloudflare Workers，base URL 由環境變數 `NEXT_PUBLIC_API_BASE_URL` 配置。

#### 3.4.1 認證端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/otp/request` | 請求 OTP |
| POST | `/api/auth/otp/verify` | 驗證 OTP，回傳 Session Token |
| POST | `/api/auth/logout` | 撤銷 Session |
| GET | `/api/auth/me` | 取得當前使用者資訊 |

#### 3.4.2 播放清單端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/playlists` | 取得使用者所有播放清單 |
| POST | `/api/playlists/sync` | 批次全量同步（上傳本機完整播放清單）。使用 D1 事務（transaction）確保原子性：先刪除該使用者所有播放清單，再逐筆插入。事務失敗時所有變更回滾，回傳 500 |
| PUT | `/api/playlists/:id` | 建立或更新單一播放清單 |
| DELETE | `/api/playlists/:id` | 刪除單一播放清單 |

#### 3.4.3 CORS 配置

| 設定 | 值 |
|------|-----|
| `Access-Control-Allow-Origin` | `https://prism.mizuki.tw`, `http://localhost:3000` |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |
| `Access-Control-Max-Age` | `86400` |

### 3.5 資料儲存架構（Storage Architecture）

#### 3.5.1 Cloudflare D1 Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID v4
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,      -- ISO 8601
  updated_at TEXT NOT NULL       -- ISO 8601
);

CREATE TABLE playlists (
  id TEXT PRIMARY KEY,           -- 客戶端生成的 playlist ID
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  versions TEXT NOT NULL,        -- JSON 陣列，結構同 PlaylistVersion[]
  created_at INTEGER NOT NULL,   -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL,   -- Unix timestamp (ms)
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
```

> **設計決策**：`versions` 欄位使用 JSON 字串而非正規化關聯表。理由：
> - 播放清單的版本列表具有順序性，正規化需額外的 `position` 欄位與排序查詢
> - `PlaylistVersion` 包含非正規化資料（`songTitle`、`originalArtist`、`videoId`、`timestamp`、`endTimestamp`），這些是為了離線可用性而刻意複製的快照
> - 播放清單為使用者私有資料，無需跨使用者查詢單一版本
> - JSON 欄位在讀寫時作為整體操作，符合播放清單的原子更新語義

#### 3.5.2 Cloudflare KV 結構

| Key 模式 | Value | TTL |
|----------|-------|-----|
| `otp:{email}` | JSON `{ code: string, attempts: number }` | 600 秒（10 分鐘） |
| `otp_rate:{email}` | 請求次數（number） | 900 秒（15 分鐘） |
| `session:{token}` | JSON `{ userId: string, email: string, createdAt: string, expiresAt: string }` | 2,592,000 秒（30 天） |

#### 3.5.3 Subrequest 估算

Cloudflare Workers 每次請求（invocation）限制 1000 個 subrequest（KV + D1 各自計算）。

| 操作 | KV | D1 | 合計 |
|------|----|----|------|
| 請求 OTP | 2（讀取速率 + 寫入 OTP） | 0 | 2 |
| 驗證 OTP | 2（讀取 OTP + 刪除 OTP） | 1（SELECT 或 INSERT user） | 3 |
| 驗證 OTP（含建立 Session） | 3（讀取 OTP + 刪除 OTP + 寫入 Session） | 1 | 4 |
| 認證中介（每個請求） | 1（讀取 Session） | 0 | 1 |
| GET /api/playlists | 1（Session 驗證） | 1（SELECT playlists） | 2 |
| PUT /api/playlists/:id | 1（Session 驗證） | 1（UPSERT playlist） | 2 |
| DELETE /api/playlists/:id | 1（Session 驗證） | 1（DELETE playlist） | 2 |
| POST /api/playlists/sync（N 個播放清單） | 1（Session 驗證） | 1（DELETE all）+ N（INSERT each） | 2 + N |
| **最壞情況：批次同步 50 個播放清單** | 1 | 51 | **52** |

最壞情況遠低於 1000 限制。

### 3.6 前端變更（Frontend Changes）

#### 3.6.1 FanAuthContext 新介面

```typescript
interface FanUser {
  id: string;
  email: string;
}

interface FanAuthContextType {
  user: FanUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

#### 3.6.2 PlaylistContext 變更

- `syncAllToCloud` 與 `syncToCloud` 改為呼叫 Workers API（base URL 由 `NEXT_PUBLIC_API_BASE_URL` 決定）
- 所有 API 請求附帶 `Authorization: Bearer {token}` 標頭
- 移除對 `/api/playlists` 的相對路徑呼叫

#### 3.6.3 Auth 頁面 UI 變更

原有的用戶名 + 密碼表單替換為兩步驟 Email OTP 流程：

1. **步驟一**：Email 輸入框 + 「取得驗證碼」按鈕
2. **步驟二**：6 位數 OTP 輸入框 + 10 分鐘倒數計時 + 「驗證」按鈕 + 「重新取得驗證碼」連結

不再區分「登入」與「註冊」分頁（兩者流程合一）。

#### 3.6.4 PlayerWrapper 組合

Provider 組合順序不變：

```
FanAuthProvider → PlayerProvider → PlaylistProviderWithAuth → children
```

`FanAuthProvider` 內部邏輯改為讀取 localStorage Token 並呼叫 `GET /api/auth/me` 驗證，取代原有的 `fetch('/api/auth/fan/check')`。

### 3.7 檔案變更清單（File Changes）

#### 刪除

| 檔案 / 目錄 | 理由 |
|-------------|------|
| `lib/fan-auth.ts` | 舊帳號密碼認證邏輯，由 Workers API 取代 |
| `lib/user-playlists.ts` | 舊檔案系統播放清單儲存，由 D1 取代 |
| `data/users.json` | 舊使用者資料，由 D1 `users` 表取代 |
| `data/user-playlists/` | 舊使用者播放清單目錄，由 D1 `playlists` 表取代 |
| `app/api/auth/fan/register/route.ts` | 舊 API 路由 |
| `app/api/auth/fan/login/route.ts` | 舊 API 路由 |
| `app/api/auth/fan/logout/route.ts` | 舊 API 路由 |
| `app/api/auth/fan/check/route.ts` | 舊 API 路由 |
| `app/api/playlists/route.ts` | 舊 API 路由 |

#### 修改

| 檔案 | 變更內容 |
|------|----------|
| `app/contexts/FanAuthContext.tsx` | 全面改寫：OTP 流程、Bearer Token、Workers API |
| `app/contexts/PlaylistContext.tsx` | API 呼叫改為 Workers base URL + Bearer Token |
| `app/auth/page.tsx` | UI 改為 Email + OTP 兩步驟流程 |
| `app/components/PlayerWrapper.tsx` | Provider 組合不變，但依賴的 Context 介面變更 |

#### 新增

| 檔案 / 目錄 | 內容 |
|-------------|------|
| `workers/` | Cloudflare Workers 專案（建議結構見 §4.3） |

## 4. Refinement

### 4.1 API Data Contracts

#### POST /api/auth/otp/request

```typescript
// Request
interface OtpRequestBody {
  email: string;  // 有效 Email 格式
}

// Response 200
interface OtpRequestResponse {
  success: true;
  message: string;  // "驗證碼已發送"（無論 Email 是否存在）
}

// Response 429
interface OtpRateLimitResponse {
  success: false;
  error: "RATE_LIMITED";
  retryAfterSeconds: number;
}
```

#### POST /api/auth/otp/verify

```typescript
// Request
interface OtpVerifyBody {
  email: string;
  code: string;   // 6 位數字字串
}

// Response 200
interface OtpVerifyResponse {
  success: true;
  token: string;     // Session Token（Base64 編碼的 256-bit 隨機值）
  user: {
    id: string;
    email: string;
  };
  isNewUser: boolean; // 前端可用於顯示歡迎訊息
}

// Response 400
interface OtpVerifyErrorResponse {
  success: false;
  error: "INVALID_CODE" | "EXPIRED" | "MAX_ATTEMPTS";
  remainingAttempts?: number;  // 僅 INVALID_CODE 時提供
}
```

#### GET /api/auth/me

```typescript
// Headers: Authorization: Bearer {token}

// Response 200
interface AuthMeResponse {
  user: {
    id: string;
    email: string;
  };
}

// Response 401
interface AuthUnauthorizedResponse {
  error: "UNAUTHORIZED";
}
```

#### POST /api/auth/logout

```typescript
// Headers: Authorization: Bearer {token}

// Response 200
interface LogoutResponse {
  success: true;
}
```

#### GET /api/playlists

```typescript
// Headers: Authorization: Bearer {token}

// Response 200
interface GetPlaylistsResponse {
  playlists: Array<{
    id: string;
    name: string;
    versions: PlaylistVersion[];
    createdAt: number;   // Unix timestamp (ms)
    updatedAt: number;   // Unix timestamp (ms)
  }>;
}
```

#### PUT /api/playlists/:id

衝突解決策略為 **last-write-wins**：比較客戶端 `updatedAt` 與雲端 `updatedAt`，取較新者。若客戶端 `updatedAt` >= 雲端 `updatedAt`，接受客戶端版本；否則保留雲端版本並回傳衝突通知。無論哪方勝出，API 一律回傳 HTTP 200（不使用 409），前端依 `conflict` 欄位決定是否顯示通知。

```typescript
// Headers: Authorization: Bearer {token}

// Request
interface UpsertPlaylistBody {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
  updatedAt: number;
}

// Response 200
interface UpsertPlaylistResponse {
  success: true;
  conflict?: boolean;                // 若發生衝突（雲端較新），回傳 true
  keptVersion?: "cloud" | "client";  // 衝突時告知前端保留了哪方版本
}
```

#### DELETE /api/playlists/:id

```typescript
// Headers: Authorization: Bearer {token}

// Response 200
interface DeletePlaylistResponse {
  success: true;
}

// Response 404
interface PlaylistNotFoundResponse {
  success: false;
  error: "NOT_FOUND";
}
```

#### POST /api/playlists/sync

```typescript
// Headers: Authorization: Bearer {token}

// Request — 全量覆蓋（登入後合併完成時使用）
interface SyncPlaylistsBody {
  playlists: Array<{
    id: string;
    name: string;
    versions: PlaylistVersion[];
    createdAt: number;
    updatedAt: number;
  }>;
}

// Response 200
interface SyncPlaylistsResponse {
  success: true;
  syncedCount: number;
}
```

#### PlaylistVersion 型別（共用）

```typescript
interface PlaylistVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}
```

### 4.2 錯誤代碼表（Error Codes）

| HTTP 狀態碼 | error 值 | 說明 | 出現端點 |
|-------------|----------|------|----------|
| 400 | `INVALID_CODE` | OTP 驗證碼錯誤 | POST /api/auth/otp/verify |
| 400 | `EXPIRED` | OTP 已過期 | POST /api/auth/otp/verify |
| 400 | `MAX_ATTEMPTS` | OTP 嘗試次數用盡 | POST /api/auth/otp/verify |
| 400 | `INVALID_EMAIL` | Email 格式無效 | POST /api/auth/otp/request |
| 400 | `INVALID_REQUEST` | 請求格式錯誤 | 全部 |
| 401 | `UNAUTHORIZED` | Token 無效或過期 | 需認證的端點 |
| 404 | `NOT_FOUND` | 播放清單不存在 | DELETE /api/playlists/:id |
| 429 | `RATE_LIMITED` | OTP 請求過於頻繁 | POST /api/auth/otp/request |
| 500 | `INTERNAL_ERROR` | 伺服器內部錯誤 | 全部 |

### 4.3 Workers 專案建議結構

```
workers/
├── wrangler.toml          # Cloudflare Workers 配置（KV、D1 綁定）
├── src/
│   ├── index.ts           # 進入點：路由分發 + CORS
│   ├── middleware/
│   │   └── auth.ts        # Session 驗證中介層
│   ├── routes/
│   │   ├── otp.ts         # OTP 請求與驗證
│   │   ├── auth.ts        # me / logout
│   │   └── playlists.ts   # 播放清單 CRUD + sync
│   ├── services/
│   │   ├── otp.ts         # OTP 生成、驗證、速率限制邏輯
│   │   ├── session.ts     # Session Token 生成、驗證、延期
│   │   └── email.ts       # Resend API 封裝
│   └── types.ts           # 共用型別定義
├── schema.sql             # D1 初始化 SQL
└── package.json
```

### 4.4 安全考量（Security Considerations）

| 風險 | 防護措施 |
|------|----------|
| Email 列舉攻擊 | OTP 請求 API 無論 Email 是否存在一律回傳成功 |
| OTP 暴力破解 | 每個 OTP 最多 3 次驗證嘗試；超過即作廢 |
| OTP 請求洪水 | 每個 Email 15 分鐘內最多 3 次請求（KV rate limiter） |
| Session Token 竊取（XSS） | Token 存於 localStorage，需搭配 Content Security Policy 與輸入消毒減輕 XSS 風險；前端不直接插入未消毒的 HTML |
| Session Token 竊取（中間人） | 所有通訊透過 HTTPS；Workers 強制 HTTPS |
| 過期 Session 堆積 | KV TTL 自動清除過期 Session，無需手動清理 |
| CORS 繞過 | 僅允許白名單 origin；不使用萬用字元 `*` |

### 4.5 OTP 流程序列圖

```
粉絲                    前端                     Workers                  KV          D1      Resend
 │                       │                        │                       │           │         │
 │── 輸入 Email ───────→ │                        │                       │           │         │
 │                       │── POST /otp/request ──→│                       │           │         │
 │                       │                        │── GET otp_rate:{email}→│           │         │
 │                       │                        │←── count (< 3) ───────│           │         │
 │                       │                        │── SET otp:{email} ───→│           │         │
 │                       │                        │── INCR otp_rate ─────→│           │         │
 │                       │                        │── Send Email ─────────│───────────│────────→│
 │                       │←── 200 { success } ────│                       │           │         │
 │                       │                        │                       │           │         │
 │── 輸入 OTP ─────────→ │                        │                       │           │         │
 │                       │── POST /otp/verify ───→│                       │           │         │
 │                       │                        │── GET otp:{email} ───→│           │         │
 │                       │                        │←── { code, attempts } │           │         │
 │                       │                        │                       │           │         │
 │                       │                        │── [驗證碼比對] ────────│           │         │
 │                       │                        │                       │           │         │
 │                       │                        │── SELECT user ────────│──────────→│         │
 │                       │                        │←── user or null ──────│───────────│         │
 │                       │                        │                       │           │         │
 │                       │                        │── [若 null: INSERT] ──│──────────→│         │
 │                       │                        │                       │           │         │
 │                       │                        │── SET session:{token}→│           │         │
 │                       │                        │── DEL otp:{email} ───→│           │         │
 │                       │←── 200 { token, user } │                       │           │         │
 │                       │                        │                       │           │         │
 │←── 顯示已登入 ────────│                        │                       │           │         │
```

### 4.6 環境變數

#### Workers（wrangler.toml / Secrets）

| 變數 | 說明 |
|------|------|
| `RESEND_API_KEY` | Resend API 金鑰（Secret） |
| `RESEND_FROM_EMAIL` | 寄件人 Email（如 `noreply@mizuki.tw`） |
| `ALLOWED_ORIGINS` | 允許的 CORS origin，逗號分隔 |
| `KV_NAMESPACE` | KV 綁定名稱 |
| `D1_DATABASE` | D1 綁定名稱 |

#### 前端（.env）

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Workers API base URL（如 `https://api.mizuki.tw`） |

### 4.7 術語表（Terminology）

以下術語為本規格書新增或重新定義，補充 SPEC.md §4.1 之術語表。

| 術語 | 英文 | 定義 |
|------|------|------|
| OTP | One-Time Password | 一次性驗證碼，6 位數字（含前導零），有效期 10 分鐘，最多 3 次驗證嘗試。用於取代密碼進行身份驗證。 |
| Session Token | — | 256-bit 不透明隨機字串（Base64 編碼），代表一個已認證的使用者工作階段。伺服端存於 KV，客戶端存於 localStorage。 |
| Bearer Token | — | 透過 HTTP `Authorization: Bearer {token}` 標頭傳送的認證權杖。本系統中 Session Token 即作為 Bearer Token 使用。 |
| 合併 | Merge | 登入時本機與雲端播放清單皆有資料的衝突解決流程。提供三種選項：合併（依 ID 去重取較新版本）、使用雲端、使用本機。 |
| 離線佇列 | Pending Sync | 離線狀態下播放清單操作的暫存機制。操作記錄於 localStorage `mizukiprism_pending_sync` key，恢復網路後自動執行全量同步。 |
| 滑動延期 | Sliding Expiry | Session 有效期管理策略。每次認證成功的 API 請求時重設過期時間（受節流限制：距上次延期不足 1 天則跳過），使活躍使用者的 Session 持續有效。 |
| Last-write-wins | — | 播放清單衝突解決策略。比較客戶端與雲端的 `updatedAt` 時間戳，保留較新者。 |
