import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'mizukiprism_migration_notice_dismissed';

// 導向僅在正式網域 prism.mizuki.tw 生效。以下驗證 localhost(dev / CI)一律靜默:
// 不彈出公告、不發生導向,確保開發者與既有 E2E 不被踢走(SPEC-MigrationNotice §5.2)。
test.describe('Migration notice — dev/localhost safety', () => {
  test('first visit on localhost shows no notice and stays on the site', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByPlaceholder('搜尋歌曲...')).toBeVisible();
    await expect(page.getByTestId('migration-notice-dialog')).toHaveCount(0);
    expect(new URL(page.url()).hostname).toBe('localhost');
  });

  test('dismissed flag on localhost does not trigger a redirect', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((key) => window.localStorage.setItem(key, 'true'), STORAGE_KEY);
    await page.reload();

    await expect(page.getByPlaceholder('搜尋歌曲...')).toBeVisible();
    await expect(page.getByTestId('migration-notice-dialog')).toHaveCount(0);
    expect(new URL(page.url()).hostname).toBe('localhost');
  });
});
