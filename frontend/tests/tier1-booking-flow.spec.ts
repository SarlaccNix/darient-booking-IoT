import { test, expect } from '@playwright/test';

/**
 * Tier 1 E2E — Core booking lifecycle
 * Requires: frontend + backend + postgres running (docker compose up)
 */
test.describe('Tier 1 — Booking flow', () => {
  test('spaces page lists available spaces', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.locator('h1')).toContainText('Spaces');
    // At least one space card rendered (seeded data)
    await expect(page.locator('[data-testid="space-card"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('create a booking → appears in bookings list → can be deleted', async ({ page }) => {
    await page.goto('/bookings/new');

    // Wait for the 3D scene container to mount (canvas or loading spinner)
    await page.waitForSelector('canvas, .animate-spin', { timeout: 10000 });

    // Fill booking form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Select space in dropdown (form is still present for accessibility)
    await page.selectOption('select#spaceId', { index: 1 });
    await page.fill('input#clientEmail', 'e2e-test@example.com');
    await page.fill('input#bookingDate', dateStr);
    await page.selectOption('select#startTime', '09:00');
    await page.selectOption('select#endTime', '10:00');

    await page.click('button[type="submit"]');

    // Should redirect to /bookings
    await page.waitForURL('**/bookings', { timeout: 8000 });
    await expect(page.locator('text=e2e-test@example.com')).toBeVisible();

    // Delete the booking
    const row = page.locator('tr', { hasText: 'e2e-test@example.com' });
    await row.locator('button', { hasText: /delete/i }).click();

    // Confirm deletion dialog if present
    page.on('dialog', (d) => d.accept());

    // Row should disappear
    await expect(row).not.toBeVisible({ timeout: 5000 });
  });
});
