import { test, expect } from '@playwright/test';

test.describe('ADMIN-001: Fan app admin boundary', () => {
  test('Next.js fan app no longer serves the legacy admin page', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).not.toContainText('策展人管理介面');
  });

  test('Next.js fan app no longer exposes legacy admin auth API', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { username: 'curator', password: 'mizuki-admin' },
    });

    expect(response.status()).toBe(404);
  });
});
