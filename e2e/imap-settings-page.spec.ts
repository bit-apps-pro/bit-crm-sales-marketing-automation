import { test, expect, Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('wp-admin/admin.php?page=bit-crm-sales-marketing-automation#/settings/imap-settings')
})

const getImapItem = (page: Page, title: string) =>
  page.getByTestId('imapItem').filter({ hasText: title }).first()

test.describe('IMAP Settings Page', () => {
  const imapTitle = 'Test IMAP'
  const userName = 'test@gmail.com'
  const password = 'password'
  const updatedUsername = 'testupdated@gmail.com'

  test('IMAP Settings Crud', async ({ page }) => {
    await test.step('Create a new IMAP', async () => {
      await page.getByRole('button', { name: 'New' }).click()
      await page.getByLabel('Title').fill(imapTitle)

      await page.getByLabel('Platform').click()

      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')

      await page.getByLabel('Username').fill(userName)
      await page.getByLabel('App Password').fill(password)

      await page.click('button[aria-label="IMAP settings save button"]')
      await expect(page.locator('button[aria-label="IMAP settings save button"]')).not.toBeVisible()
    })

    await test.step('Check if IMAP is created', async () => {
      const imapItem = getImapItem(page, imapTitle)
      await expect(imapItem).toBeVisible()
    })

    await test.step('Edit IMAP', async () => {
      const imapItem = getImapItem(page, imapTitle)
      await imapItem.getByTestId('imapItemDropdown').click()
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('Username').fill(updatedUsername)

      await page.click('button[aria-label="IMAP settings save button"]')
      await expect(page.locator('button[aria-label="IMAP settings save button"]')).not.toBeVisible()
      await expect(imapItem.getByText(updatedUsername)).toBeVisible()
    })

    await test.step('Delete IMAP', async () => {
      const imapItem = getImapItem(page, imapTitle)
      await imapItem.getByTestId('imapItemDropdown').click()

      await page.getByRole('button', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Yes' }).click()

      await expect(getImapItem(page, imapTitle)).not.toBeVisible({ timeout: 5000 })
    })
  })
})
