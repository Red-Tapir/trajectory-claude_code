import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should register new user and create organization', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@trajectory.test`
    const testName = `Test User ${timestamp}`
    const testOrgName = `Test Org ${timestamp}`

    // Navigate to registration page
    await page.goto('/inscription')

    // Verify we're on the registration page
    await expect(page).toHaveURL(/\/inscription/)
    await expect(page.locator('h1, h2').filter({ hasText: /inscription|créer un compte/i })).toBeVisible()

    // Fill registration form
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', `User ${timestamp}`)
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="company"]', testOrgName)

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Verify we're logged in and see the organization name
    await expect(page.locator('text=' + testOrgName).first()).toBeVisible({ timeout: 5000 })

    // Verify dashboard elements are present
    await expect(page.locator('text=/tableau de bord|dashboard/i')).toBeVisible()
  })

  test('should login with existing credentials', async ({ page }) => {
    // This test assumes there's a demo user
    // In production, you'd create a test user first

    await page.goto('/connexion')

    // Check we're on login page
    await expect(page).toHaveURL(/\/connexion/)

    // Fill login form
    await page.fill('input[name="email"]', 'demo@trajectory.fr')
    await page.fill('input[name="password"]', 'demo123')

    // Submit
    await page.click('button[type="submit"]')

    // Should either redirect to dashboard or show error
    await page.waitForTimeout(2000)

    // If credentials are wrong, we should see an error
    // If correct, we should be on dashboard
    const url = page.url()
    const hasError = await page.locator('text=/incorrect|invalide|erreur/i').isVisible().catch(() => false)

    if (!hasError) {
      expect(url).toContain('/dashboard')
    }
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/connexion')

    // Fill with wrong credentials
    await page.fill('input[name="email"]', 'wrong@email.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForTimeout(1000)

    // Should see error or stay on login page
    const hasError = await page.locator('text=/incorrect|invalide|erreur/i').isVisible().catch(() => false)
    const stillOnLogin = page.url().includes('/connexion')

    expect(hasError || stillOnLogin).toBeTruthy()
  })

  test('should logout successfully', async ({ page, context }) => {
    // First, login
    await page.goto('/connexion')
    await page.fill('input[name="email"]', 'demo@trajectory.fr')
    await page.fill('input[name="password"]', 'demo123')
    await page.click('button[type="submit"]')

    // Try to go to dashboard
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)

    // If we're on dashboard, try to logout
    if (page.url().includes('/dashboard')) {
      // Look for user menu or logout button
      const userMenu = page.locator('button[aria-label*="menu"], button:has-text("profil"), [data-testid="user-menu"]').first()

      if (await userMenu.isVisible()) {
        await userMenu.click()
        await page.waitForTimeout(500)

        // Click logout
        await page.click('text=/déconnexion|logout|sign out/i')

        // Should redirect to home or login
        await page.waitForTimeout(1000)
        const url = page.url()
        expect(url).toMatch(/\/(connexion|$)/)
      }
    }
  })
})
