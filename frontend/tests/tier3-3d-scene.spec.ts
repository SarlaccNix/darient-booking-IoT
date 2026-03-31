import { test, expect } from '@playwright/test';

/**
 * Tier 3 E2E — 3D floor plan on the booking page
 */
test.describe('Tier 3 — 3D booking scene', () => {
  test.beforeEach(async ({ page }) => {
    // Mock spaces endpoint so scene has something to render
    await page.route('**/api/v1/spaces*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'space_alpha_1',
            name: 'Board Room',
            capacity: 12,
            siteId: 'site_alpha',
            site: { id: 'site_alpha', name: 'Alpha Tower' },
            locationReference: 'Floor 3, North Wing',
            description: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      });
    });

    // Mock bookings endpoint for availability check
    await page.route('**/api/v1/bookings*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, pageSize: 200, totalPages: 0 } }),
      });
    });
  });

  test('3D canvas renders on the new booking page', async ({ page }) => {
    await page.goto('/bookings/new');
    // WebGL canvas should appear (SceneCanvas dynamic import)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 12000 });
  });

  test('site tab switcher is present', async ({ page }) => {
    await page.goto('/bookings/new');
    await expect(page.locator('button', { hasText: 'Alpha Tower' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Beta Hub' })).toBeVisible();
  });

  test('booking form is visible below the scene', async ({ page }) => {
    await page.goto('/bookings/new');
    await expect(page.locator('text=Booking details')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('input#clientEmail')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
