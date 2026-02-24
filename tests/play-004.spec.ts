import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('PLAY-004: Shuffle & Repeat Button UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Start playback so mini player / modal controls appear
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();
  });

  test('AC1: Desktop shuffle button toggles visual state', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    const shuffleBtn = page.locator('[data-testid="desktop-shuffle-button"]');
    await expect(shuffleBtn).toBeVisible();

    // Initially should be tertiary color (inactive)
    const initialColor = await shuffleBtn.evaluate(
      (el) => getComputedStyle(el).color
    );

    // Click to activate
    await shuffleBtn.click();

    // Should now have accent-pink color (active)
    const activeColor = await shuffleBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(activeColor).not.toEqual(initialColor);

    // Click again to deactivate
    await shuffleBtn.click();
    const deactivatedColor = await shuffleBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(deactivatedColor).toEqual(initialColor);

    await page.screenshot({ path: '.screenshots/play-004-ac1-shuffle-toggle.png', fullPage: true });
  });

  test('AC2: Desktop repeat button cycles through off → all → one → off', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const repeatBtn = page.locator('[data-testid="desktop-repeat-button"]');
    await expect(repeatBtn).toBeVisible();

    // State 1: OFF — tertiary color, Repeat icon (no "1")
    const offColor = await repeatBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    // Should NOT have Repeat1 icon (which has a "1" badge)
    await expect(repeatBtn.locator('svg')).toBeVisible();

    // Click → ALL
    await repeatBtn.click();
    const allColor = await repeatBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(allColor).not.toEqual(offColor);

    // Click → ONE — icon should change to Repeat1
    await repeatBtn.click();
    const oneColor = await repeatBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    // Still active (accent) color
    expect(oneColor).not.toEqual(offColor);

    // Click → OFF again
    await repeatBtn.click();
    const backToOffColor = await repeatBtn.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(backToOffColor).toEqual(offColor);

    await page.screenshot({ path: '.screenshots/play-004-ac2-repeat-cycle.png', fullPage: true });
  });

  test('AC3: NowPlayingModal has shuffle and repeat buttons', async ({ page }) => {
    // Open the now playing modal by clicking on the mini player area
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await miniPlayer.click();

    const modal = page.locator('[data-testid="now-playing-modal"]');
    await expect(modal).toBeVisible();

    // Verify shuffle and repeat buttons exist in modal
    await expect(modal.locator('[data-testid="modal-shuffle-button"]')).toBeVisible();
    await expect(modal.locator('[data-testid="modal-repeat-button"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-004-ac3-modal-buttons.png', fullPage: true });
  });

  test('AC4: Mobile shuffle button toggles visual state', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    const shuffleBtn = page.locator('[data-testid="mobile-shuffle-button"]');
    await expect(shuffleBtn).toBeVisible();

    // Click to toggle — should change appearance
    const initialBg = await shuffleBtn.evaluate(
      (el) => getComputedStyle(el).background
    );

    await shuffleBtn.click();

    const toggledBg = await shuffleBtn.evaluate(
      (el) => getComputedStyle(el).background
    );
    expect(toggledBg).not.toEqual(initialBg);

    await page.screenshot({ path: '.screenshots/play-004-ac4-mobile-shuffle.png', fullPage: true });
  });
});
