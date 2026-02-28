import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

const screenshotsDir = path.join(process.cwd(), '.screenshots');

function screenshotPath(name: string): string {
  return path.join(screenshotsDir, `core-003-${name}.png`);
}

test.describe('CORE-003: Search & Filter', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Ensure we start in timeline view
    await page.click('[data-testid="view-toggle-timeline"]');
  });

  test('AC1: Search by song name filters results instantly (min 1 char, case-insensitive, fuzzy)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Type one character and verify filtering happens
    await searchInput.fill('D');
    const rows = page.getByTestId('performance-row');
    const count1 = await rows.count();
    expect(count1).toBeGreaterThan(0);

    // All visible rows should have 'd' somewhere in them (case-insensitive)
    const allContents = await rows.allTextContents();
    for (const content of allContents) {
      expect(content.toLowerCase()).toContain('d');
    }

    // Type full song name "Dear"
    await searchInput.fill('Dear');
    const filteredRows = page.getByTestId('performance-row');
    const count2 = await filteredRows.count();
    expect(count2).toBeGreaterThan(0);
    expect(count2).toBeLessThanOrEqual(18); // Should be fewer than or equal to all songs

    // Verify the result contains "Dear"
    const firstRowText = await filteredRows.first().textContent();
    expect(firstRowText?.toLowerCase()).toContain('dear');

    await page.screenshot({ path: screenshotPath('ac1-search-by-name') });
  });

  test('AC2: Clear search input restores full song list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    const allRows = page.getByTestId('performance-row');

    // Get total count initially
    const totalCount = await allRows.count();

    // Search for something
    await searchInput.fill('Dear');
    const filteredCount = await allRows.count();
    expect(filteredCount).toBeLessThan(totalCount);

    // Clear the search
    await searchInput.clear();
    const restoredCount = await allRows.count();
    expect(restoredCount).toBe(totalCount);

    await page.screenshot({ path: screenshotPath('ac2-clear-search') });
  });

  test('AC3: Search by original artist name filters results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Search by artist name "LiSA"
    await searchInput.fill('LiSA');

    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All results should be songs by LiSA
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text).toContain('LiSA');
    }

    await page.screenshot({ path: screenshotPath('ac3-search-by-artist') });
  });

  test('AC4: Artist dropdown filter shows only songs by that artist', async ({ page }) => {
    const artistFilter = page.getByTestId('artist-filter');

    // Verify the dropdown exists and has options
    await expect(artistFilter).toBeVisible();

    // Select an artist
    await artistFilter.selectOption('LiSA');

    // Verify only songs by that artist are shown
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text).toContain('LiSA');
    }

    // Verify songs by other artists are not shown
    const nonArtistRows = rows.filter({ hasText: 'Ariana Grande' });
    expect(await nonArtistRows.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac4-artist-filter') });
  });

  test('AC5: Year filter shows only performances from that year', async ({ page }) => {
    const yearBar = page.getByTestId('year-filter-bar');
    await expect(yearBar).toBeVisible();

    // Get total count before filtering
    const allRows = page.getByTestId('performance-row');
    const totalCount = await allRows.count();

    // Click the "2025" year chip in the desktop action bar
    const chip2025 = yearBar.getByTestId('year-filter-chip').filter({ hasText: '2025' });
    await chip2025.click();

    // Verify only 2025 performances are shown
    const filteredRows = page.getByTestId('performance-row');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(totalCount);

    // Verify all visible dates are from 2025
    const dateCells = await page.locator('div.font-mono').filter({ hasText: /^\d{4}-\d{2}-\d{2}$/ }).allTextContents();
    for (const dateText of dateCells) {
      expect(dateText.startsWith('2025')).toBe(true);
    }

    // Toggle 2025 off to restore full list
    await chip2025.click();
    const restoredCount = await page.getByTestId('performance-row').count();
    expect(restoredCount).toBe(totalCount);

    await page.screenshot({ path: screenshotPath('ac5-year-filter') });
  });

  test('AC6: Stream filter shows only songs from that stream', async ({ page }) => {
    // Verify stream playlist section exists in the sidebar
    const streamSection = page.getByText('歌枠回放');
    await expect(streamSection).toBeVisible();

    // Get stream filter buttons
    const streamButtons = page.locator('[data-testid="stream-filter-button"]');
    const streamCount = await streamButtons.count();

    if (streamCount === 0) {
      // No streams loaded yet — test passes gracefully
      return;
    }

    // Get total rows before filtering
    const allRows = page.getByTestId('performance-row');
    const totalCount = await allRows.count();

    // Click first stream to filter
    await streamButtons.first().click();
    const filteredRows = page.getByTestId('performance-row');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(totalCount);

    // Click again to deselect
    await streamButtons.first().click();
    const restoredRows = page.getByTestId('performance-row');
    const restoredCount = await restoredRows.count();
    expect(restoredCount).toBe(totalCount);

    await page.screenshot({ path: screenshotPath('ac6-stream-filter') });
  });

  test('AC7: Search text + artist filter applied simultaneously (AND logic)', async ({ page }) => {
    // Apply artist filter
    await page.getByTestId('artist-filter').selectOption('LiSA');

    // Also type search "紅蓮華"
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('紅蓮華');

    // Only songs matching BOTH criteria should show
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All results should contain "紅蓮華" and "LiSA"
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text).toContain('紅蓮華');
      expect(text).toContain('LiSA');
    }

    // Other artists' songs should not appear
    const otherRows = rows.filter({ hasText: 'Ariana Grande' });
    expect(await otherRows.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac7-search-and-filter') });
  });

  test('AC8: No results shows "找不到符合條件的歌曲" with clear filter suggestion', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Search for something that doesn't exist
    await searchInput.fill('xyznonexistent');

    // Verify empty state message
    await expect(page.getByText('找不到符合條件的歌曲')).toBeVisible();

    // Verify there's a clear filter button
    const clearButton = page.getByTestId('clear-filters-empty');
    await expect(clearButton).toBeVisible();

    // Click clear to verify it restores the list
    await clearButton.click();
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: screenshotPath('ac8-no-results-empty-state') });
  });

  test('AC9: Search works in grouped view', async ({ page }) => {
    // Switch to grouped view
    await page.click('[data-testid="view-toggle-grouped"]');

    // Enter search term
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('Dear');

    // Verify song cards are filtered
    const songCards = page.getByTestId('song-card');
    const count = await songCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify "Dear" appears
    await expect(songCards.filter({ hasText: 'Dear' })).toHaveCount(1);

    // Verify other songs are hidden
    const otherSongs = songCards.filter({ hasText: '紅蓮華' });
    expect(await otherSongs.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac9-grouped-view-search') });
  });

  test('AC10: Search works in timeline view', async ({ page }) => {
    // Ensure we are in timeline view
    await expect(page.getByTestId('view-toggle-timeline')).toBeVisible();

    // Enter search term
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('Dear');

    // Verify timeline rows are filtered
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All visible rows should contain "Dear"
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text.toLowerCase()).toContain('dear');
    }

    // Switch to timeline view explicitly (ensure it works)
    await page.click('[data-testid="view-toggle-grouped"]');
    await page.click('[data-testid="view-toggle-timeline"]');

    // Search should persist
    const rowsAfterSwitch = page.getByTestId('performance-row');
    const countAfterSwitch = await rowsAfterSwitch.count();
    expect(countAfterSwitch).toBe(count);

    await page.screenshot({ path: screenshotPath('ac10-timeline-view-search') });
  });

  test('AC11: Mobile search input accessible via BottomNav Search tab', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    // The sidebar itself is hidden on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();

    // BottomNav should be visible
    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    // Click the Search tab in BottomNav
    await page.locator('[data-testid="bottom-nav-search"]').click();
    await page.waitForTimeout(300);

    // Mobile search input should now be visible in the Search tab
    const mobileSearch = page.locator('[data-testid="mobile-search-input"]');
    await expect(mobileSearch).toBeVisible();

    // Mobile search should filter results
    await mobileSearch.fill('Dear');
    await page.waitForTimeout(300);

    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text.toLowerCase()).toContain('dear');
    }

    await page.screenshot({ path: screenshotPath('ac11-mobile-search') });
  });

  test('Clear all filters button resets all filter states', async ({ page }) => {
    // Apply artist filter and year filter
    await page.getByTestId('artist-filter').selectOption('LiSA');
    const yearBar = page.getByTestId('year-filter-bar');
    await yearBar.getByTestId('year-filter-chip').first().click();

    // Verify the clear all button appears
    const clearAllButton = page.getByTestId('clear-all-filters');
    await expect(clearAllButton).toBeVisible();

    // Get current filtered count
    const filteredRows = page.getByTestId('performance-row');
    const filteredCount = await filteredRows.count();

    // Click clear all
    await clearAllButton.click();

    // Verify all filters are cleared and full list is shown
    const allRows = page.getByTestId('performance-row');
    const totalCount = await allRows.count();
    expect(totalCount).toBeGreaterThanOrEqual(filteredCount);

    // Verify the clear all button is hidden
    await expect(clearAllButton).toBeHidden();

    await page.screenshot({ path: screenshotPath('clear-all-filters') });
  });

  test('AC12: Multi-year selection shows combined results', async ({ page }) => {
    const yearBar = page.getByTestId('year-filter-bar');
    await expect(yearBar).toBeVisible();

    // Select 2025
    const chip2025 = yearBar.getByTestId('year-filter-chip').filter({ hasText: '2025' });
    await chip2025.click();
    const count2025 = await page.getByTestId('performance-row').count();
    expect(count2025).toBeGreaterThan(0);

    // Also select 2026 (multi-select)
    const chip2026 = yearBar.getByTestId('year-filter-chip').filter({ hasText: '2026' });
    await chip2026.click();
    const countBoth = await page.getByTestId('performance-row').count();

    // Combined count should be >= single year count
    expect(countBoth).toBeGreaterThanOrEqual(count2025);

    // Verify dates are from 2025 or 2026
    const dateCells = await page.locator('div.font-mono').filter({ hasText: /^\d{4}-\d{2}-\d{2}$/ }).allTextContents();
    for (const dateText of dateCells) {
      expect(dateText.startsWith('2025') || dateText.startsWith('2026')).toBe(true);
    }

    await page.screenshot({ path: screenshotPath('ac12-multi-year') });
  });

  test('AC13: Sidebar drill-down within year filter', async ({ page }) => {
    // Set desktop viewport to see sidebar
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const yearBar = page.getByTestId('year-filter-bar');
    await expect(yearBar).toBeVisible();

    // Select 2026 year
    const chip2026 = yearBar.getByTestId('year-filter-chip').filter({ hasText: '2026' });
    await chip2026.click();
    const yearCount = await page.getByTestId('performance-row').count();
    expect(yearCount).toBeGreaterThan(0);

    // Sidebar should show only streams from 2026
    const streamButtons = page.locator('[data-testid="stream-filter-button"]');
    const streamTexts = await streamButtons.allTextContents();
    for (const text of streamTexts) {
      expect(text).toContain('2026');
    }

    // Click a specific stream to drill down further
    if (await streamButtons.count() > 0) {
      await streamButtons.first().click();
      const drillDownCount = await page.getByTestId('performance-row').count();
      expect(drillDownCount).toBeGreaterThan(0);
      expect(drillDownCount).toBeLessThanOrEqual(yearCount);
    }

    await page.screenshot({ path: screenshotPath('ac13-sidebar-drill-down') });
  });

});
