import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('wp-admin/admin.php?page=bit-crm-sales-marketing-automation#/tags')
})

test.describe('Tags Page', () => {
  const tagName = 'Test Tag'
  let tagRowData: import('@playwright/test').Locator

  test('Tags Crud', async ({ page }) => {
    await test.step('Create a new tag', async () => {
      await page.getByRole('button', { name: 'New' }).click()
      await page.getByLabel('Title').fill(tagName)

      await page.getByRole('combobox', { name: 'Module' }).click()
      await page.getByText('Lead', { exact: true }).click()

      await page.click('button[aria-label="Tag save button"]')
      await expect(page.locator('button[aria-label="Tag save button"]')).not.toBeVisible()
    })

    await test.step('Verify the tag is created and visible in the table', async () => {
      await page.waitForTimeout(1000)

      const tagCell = page.locator('td').filter({ hasText: tagName }).first()
      let tagFound = await tagCell.isVisible()

      while (!tagFound) {
        const nextPageButton = page.locator('li.ant-pagination-next')
        await page.waitForSelector('li.ant-pagination-next button', { timeout: 5000 })
        await expect(nextPageButton).toBeVisible()
        if (await nextPageButton.isEnabled()) {
          await nextPageButton.click()
          await page.waitForTimeout(1000)
          tagFound = await tagCell.isVisible()
        } else {
          throw new Error(`Tag "${tagName}" not found in any page`)
        }
      }

      const tagRow = tagCell.locator('..')
      await expect(tagRow).toBeVisible()
      tagRowData = tagRow
    })

    await test.step('Edit tag', async () => {
      const editButton = tagRowData.locator('button[aria-label="Tag edit button"]')
      await editButton.click()
      await page.getByRole('button', { name: 'Cancel' }).click()

      await expect(page.locator('button[aria-label="Tag save button"]')).not.toBeVisible()
    })

    await test.step('Delete tag', async () => {
      const deleteButton = tagRowData.locator('button[aria-label="Tag delete button"]')
      await deleteButton.click()
      await page.getByRole('button', { name: 'Yes' }).click()

      await expect(tagRowData).not.toBeVisible({ timeout: 5000 })
    })
  })
})
