import test, { expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('wp-admin/admin.php?page=bit-crm-sales-marketing-automation#/')
})

test.describe('Dashboard Page', () => {
  test('dashboard page loaded', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  })
})
