# Migration Notice Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站顯示一次性網域遷移公告 popup,點「知道了」後寫入 localStorage 永久靜音。

**Architecture:** 新增 `migrationNoticeStorage.ts`(仿 `catalogViewStorage.ts` 的可注入 storage 模式)+ `MigrationNoticeModal.tsx`(仿 `CreatePlaylistDialog.tsx` 的 createPortal 毛玻璃 modal),掛載於 `app/layout.tsx`。Playwright config 以 `storageState` 預填 dismissed flag 保護既有 E2E。

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind、tsx + node:assert(單元測試)、Playwright(E2E)。

**Spec:** [SPEC-MigrationNotice.md](./SPEC-MigrationNotice.md)

---

## File Structure

| 檔案 | 動作 | 職責 |
|------|------|------|
| `app/lib/migrationNoticeStorage.ts` | Create | dismissal flag 的讀寫(localStorage) |
| `tests/migration-notice-storage.ts` | Create | storage module 單元測試 |
| `package.json` | Modify | 掛 `test:migration-notice-storage` script + lint 清單 |
| `app/components/MigrationNoticeModal.tsx` | Create | 公告 popup UI 與顯示/關閉邏輯 |
| `app/layout.tsx` | Modify | 全站掛載 modal |
| `playwright.config.ts` | Modify | 預填 dismissed flag 保護既有 spec |
| `tests/migration-notice.spec.ts` | Create | 公告行為 E2E |

---

### Task 1: Storage Module(TDD)

**Files:**
- Create: `tests/migration-notice-storage.ts`
- Create: `app/lib/migrationNoticeStorage.ts`
- Modify: `package.json`

- [ ] **Step 1.1: 寫失敗的單元測試**

建立 `tests/migration-notice-storage.ts`:

```typescript
import assert from 'node:assert/strict';
import {
  MIGRATION_NOTICE_DISMISSED_STORAGE_KEY,
  readMigrationNoticeDismissed,
  writeMigrationNoticeDismissed,
} from '../app/lib/migrationNoticeStorage';

function createNoticeStorage(
  initialValues: Record<string, string> = {},
  options: { failGet?: boolean; failSet?: boolean } = {},
) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key: string) => {
      if (options.failGet) {
        throw new Error('getItem failed');
      }
      return values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (options.failSet) {
        throw new Error('setItem failed');
      }
      values.set(key, value);
    },
    values,
  };
}

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

function restoreLocalStorage(): void {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'localStorage');
}

// read:Node 環境無 localStorage → false
assert.equal(readMigrationNoticeDismissed(), false);
// read:空 storage → false
assert.equal(readMigrationNoticeDismissed(createNoticeStorage()), false);
// read:已確認 → true
assert.equal(
  readMigrationNoticeDismissed(createNoticeStorage({
    [MIGRATION_NOTICE_DISMISSED_STORAGE_KEY]: 'true',
  })),
  true,
);
// read:非預期值 → false
assert.equal(
  readMigrationNoticeDismissed(createNoticeStorage({
    [MIGRATION_NOTICE_DISMISSED_STORAGE_KEY]: 'yes',
  })),
  false,
);
// read:getItem 拋錯 → false
assert.equal(readMigrationNoticeDismissed(createNoticeStorage({}, { failGet: true })), false);

// write:成功寫入
const writableStorage = createNoticeStorage();
assert.equal(writeMigrationNoticeDismissed(writableStorage), true);
assert.equal(writableStorage.values.get(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY), 'true');

// write:無 storage → false
assert.equal(writeMigrationNoticeDismissed(), false);
// write:setItem 拋錯 → false
assert.equal(writeMigrationNoticeDismissed(createNoticeStorage({}, { failSet: true })), false);

// localStorage getter 本身拋錯 → 安全預設值
try {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('localStorage unavailable');
    },
  });

  assert.equal(readMigrationNoticeDismissed(), false);
  assert.equal(writeMigrationNoticeDismissed(), false);
} finally {
  restoreLocalStorage();
}
```

- [ ] **Step 1.2: 跑測試確認失敗**

Run: `npx tsx tests/migration-notice-storage.ts`
Expected: FAIL — `Cannot find module '../app/lib/migrationNoticeStorage'`

- [ ] **Step 1.3: 實作 storage module**

建立 `app/lib/migrationNoticeStorage.ts`:

```typescript
import { getLocalStorage } from './browserStorage';

export const MIGRATION_NOTICE_DISMISSED_STORAGE_KEY = 'mizukiprism_migration_notice_dismissed';

type MigrationNoticeStorageReader = Pick<Storage, 'getItem'>;
type MigrationNoticeStorageWriter = Pick<Storage, 'setItem'>;

export function readMigrationNoticeDismissed(
  storage?: MigrationNoticeStorageReader,
): boolean {
  try {
    const resolvedStorage = storage ?? getLocalStorage();
    if (!resolvedStorage) return false;

    return resolvedStorage.getItem(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeMigrationNoticeDismissed(
  storage?: MigrationNoticeStorageWriter,
): boolean {
  try {
    const resolvedStorage = storage ?? getLocalStorage();
    if (!resolvedStorage) return false;

    resolvedStorage.setItem(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 1.4: 跑測試確認通過**

Run: `npx tsx tests/migration-notice-storage.ts`
Expected: PASS(無輸出,exit code 0)

- [ ] **Step 1.5: 掛進 package.json**

`package.json` 兩處修改:

1. `lint` script 的檔案清單中,在 `tests/liked-songs.ts` 之後插入 `tests/migration-notice-storage.ts`:

```
"lint": "eslint app lib shared tests/browser-storage.ts tests/catalog-data.ts tests/catalog-view-storage.ts tests/contracts.ts tests/liked-songs.ts tests/migration-notice-storage.ts tests/player-controls.ts ...(其餘不變)",
```

2. scripts 中在 `"test:liked-songs"` 之後新增:

```json
"test:migration-notice-storage": "tsx tests/migration-notice-storage.ts",
```

- [ ] **Step 1.6: 跑 lint 與測試**

Run: `npm run lint && npm run test:migration-notice-storage`
Expected: lint 無錯誤、測試 exit 0

- [ ] **Step 1.7: Commit**

```bash
git status
git add app/lib/migrationNoticeStorage.ts tests/migration-notice-storage.ts package.json
git commit -m "feat: add migration notice storage helpers"
```

---

### Task 2: Modal 元件 + 全站掛載 + E2E(同一 commit,避免中間狀態弄壞既有測試)

**Files:**
- Create: `tests/migration-notice.spec.ts`
- Create: `app/components/MigrationNoticeModal.tsx`
- Modify: `app/layout.tsx`
- Modify: `playwright.config.ts`

- [ ] **Step 2.1: 寫失敗的 E2E 測試**

建立 `tests/migration-notice.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'mizukiprism_migration_notice_dismissed';
const NEW_SITE_URL = 'https://prism.oshi.tw/mizuki';

// 覆寫 config 預填的 dismissed flag,模擬首次造訪
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Migration notice popup', () => {
  test('first visit shows the notice with correct content', async ({ page }) => {
    await page.goto(BASE_URL);

    const dialog = page.getByTestId('migration-notice-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      '本網站 (prism.mizuki.tw) 即將合併回 prism.oshi.tw/mizuki 以便於進行管理。',
    );
    await expect(dialog).toContainText('預計將於 7/1 開始進行自動重導向到');

    const link = page.getByTestId('migration-notice-link');
    await expect(link).toHaveAttribute('href', NEW_SITE_URL);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('backdrop click does not dismiss the notice', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByTestId('migration-notice-dialog')).toBeVisible();
    await page
      .getByTestId('migration-notice-backdrop')
      .click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('migration-notice-dialog')).toBeVisible();
  });

  test('acknowledging hides the notice and persists dismissal', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByTestId('migration-notice-acknowledge').click();
    await expect(page.getByTestId('migration-notice-dialog')).not.toBeVisible();

    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).toBe('true');

    // 重新整理後不再顯示:先等待 client 端 UI 掛載完成,再驗證 popup 不存在
    await page.reload();
    await expect(page.getByPlaceholder('搜尋歌曲...')).toBeVisible();
    await expect(page.getByTestId('migration-notice-dialog')).toHaveCount(0);
  });

  test('dismissed flag prevents the notice from appearing', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((key) => window.localStorage.setItem(key, 'true'), STORAGE_KEY);
    await page.reload();

    await expect(page.getByPlaceholder('搜尋歌曲...')).toBeVisible();
    await expect(page.getByTestId('migration-notice-dialog')).toHaveCount(0);
  });
});
```

- [ ] **Step 2.2: 跑新 E2E 確認失敗**

Run: `npx playwright test tests/migration-notice.spec.ts`
Expected: FAIL — `migration-notice-dialog` testid 不存在(timeout)

- [ ] **Step 2.3: 實作 Modal 元件**

建立 `app/components/MigrationNoticeModal.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  readMigrationNoticeDismissed,
  writeMigrationNoticeDismissed,
} from '../lib/migrationNoticeStorage';

const NEW_SITE_URL = 'https://prism.oshi.tw/mizuki';

export default function MigrationNoticeModal() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShow(!readMigrationNoticeDismissed());
  }, []);

  if (!mounted || !show) return null;

  const handleAcknowledge = () => {
    // 寫入失敗也照樣關閉:下次造訪自然再顯示(SPEC §3.2)
    writeMigrationNoticeDismissed();
    setShow(false);
  };

  return createPortal(
    <>
      {/* Backdrop:無 onClick,重要公告需明確按「知道了」確認 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
        data-testid="migration-notice-backdrop"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-notice-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-[150] p-6"
        data-testid="migration-notice-dialog"
      >
        <h2 id="migration-notice-title" className="text-white text-xl font-medium mb-4">
          網站遷移公告
        </h2>

        <p className="text-white/90 leading-relaxed mb-2">
          本網站 (prism.mizuki.tw) 即將合併回 prism.oshi.tw/mizuki 以便於進行管理。
        </p>
        <p className="text-white/90 leading-relaxed mb-6">
          預計將於 7/1 開始進行自動重導向到{' '}
          <a
            href={NEW_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 underline break-all"
            data-testid="migration-notice-link"
          >
            {NEW_SITE_URL}
          </a>
          。
        </p>

        <button
          onClick={handleAcknowledge}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg font-medium"
          data-testid="migration-notice-acknowledge"
        >
          知道了
        </button>
      </div>
    </>,
    document.body,
  );
}
```

- [ ] **Step 2.4: 掛載到 layout**

修改 `app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import PlayerWrapper from "./components/PlayerWrapper";
import MigrationNoticeModal from "./components/MigrationNoticeModal";
```

body 內:

```tsx
      <body className="font-sans">
        <PlayerWrapper>{children}</PlayerWrapper>
        <MigrationNoticeModal />
      </body>
```

- [ ] **Step 2.5: Playwright config 預填 dismissed flag**

修改 `playwright.config.ts` 的 `use` 區塊:

```typescript
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // 預填遷移公告已讀 flag,避免 popup backdrop 攔截既有測試的點擊
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            { name: 'mizukiprism_migration_notice_dismissed', value: 'true' },
          ],
        },
      ],
    },
  },
```

- [ ] **Step 2.6: 跑新 E2E 確認通過**

Run: `npx playwright test tests/migration-notice.spec.ts`
Expected: 4 passed

- [ ] **Step 2.7: 跑完整 E2E 確認無回歸**

Run: `npx playwright test`
Expected: 全部通過(既有 spec 受 storageState 保護)

- [ ] **Step 2.8: lint + build 驗證**

Run: `npm run lint && npm run build`
Expected: 無錯誤

- [ ] **Step 2.9: Commit**

```bash
git status
git add app/components/MigrationNoticeModal.tsx app/layout.tsx playwright.config.ts tests/migration-notice.spec.ts
git commit -m "feat: show one-time domain migration notice popup"
```

---

## Verification Checklist(完成後逐項確認)

- [ ] `npm run test:migration-notice-storage` 通過
- [ ] `npx playwright test` 全綠
- [ ] `npm run lint` 無錯誤
- [ ] `npm run build` 成功
- [ ] 手動驗證:無痕視窗開 localhost:3000 → popup 顯示 → 點「知道了」→ 重新整理不再顯示
