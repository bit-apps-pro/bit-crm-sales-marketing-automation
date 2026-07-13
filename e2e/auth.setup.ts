import { test as setup } from '@playwright/test'
import path from 'node:path'

const authFile = path.join(process.cwd(), 'playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  const username = process.env.WP_USERNAME
  const password = process.env.WP_PASSWORD

  if (!username || !password) {
    throw new Error('Missing environment variables: WP_USERNAME, or WP_PASSWORD')
  }

  await page.goto('/wp-login.php')

  await page.getByRole('textbox', { name: 'Username' }).fill(username)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Log In' }).click()

  await page.waitForURL('**/wp-admin/', { timeout: 5000 })

  await page.context().storageState({ path: authFile })
})
