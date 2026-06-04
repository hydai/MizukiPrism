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
