import { test, expect } from '@playwright/test';

/**
 * Tier 2 E2E — Admin dashboard telemetry
 * Mocks the SSE stream so tests don't depend on a live IoT simulator.
 */
test.describe('Tier 2 — Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the REST initial-load endpoint with seeded telemetry data
    await page.route('**/api/v1/telemetry', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'telem_1',
            spaceId: 'space_alpha_1',
            siteId: 'site_alpha',
            tempC: 23.5,
            humidityPct: 47.0,
            co2Ppm: 750,
            occupancy: 3,
            powerW: 120,
            recordedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            space: { id: 'space_alpha_1', name: 'Board Room', capacity: 12 },
            site: { id: 'site_alpha', name: 'Alpha Tower' },
          },
        ]),
      });
    });

    // Return an empty SSE stream (no live events needed for these tests)
    await page.route('**/api/v1/telemetry/stream', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: '',
      });
    });
  });

  test('card view renders telemetry cards', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Board Room')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=23.5')).toBeVisible();
  });

  test('3D view toggle switches to scene canvas', async ({ page }) => {
    await page.goto('/admin');
    await page.click('button', { hasText: '3D View' });
    // Canvas element should appear (Three.js scene)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  });
});
