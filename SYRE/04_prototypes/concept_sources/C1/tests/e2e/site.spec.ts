import AxeBuilder from '@axe-core/playwright'
import { expect, test, type ConsoleMessage, type Request, type Response } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1440x1000', width: 1440, height: 1000 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
] as const

type ViewportResult = {
  viewport: string
  dimensions: { width: number; height: number }
  url: string
  title: string
  screenshot: string
  accessibilityViolations: Array<{ id: string; impact: string | null; nodes: number }>
  consoleErrors: string[]
  pageErrors: string[]
  failedRequests: string[]
  failedResponses: string[]
  brokenAssets: string[]
  horizontalOverflow: number
  clippedControls: string[]
  cumulativeLayoutShift: number
  skipLinkFocused: boolean
  menuBehavior: 'passed' | 'not-applicable'
  faqBehavior: 'passed'
  briefBehavior: 'passed'
}

test('validates the complete responsive SYRE experience and writes deterministic evidence', async ({ page }) => {
  test.setTimeout(180_000)
  const evidenceDirectory = path.resolve('evidence')
  await mkdir(evidenceDirectory, { recursive: true })

  const report = {
    generatedBy: 'Playwright + axe-core',
    target: 'production preview from dist/',
    requiredViewports: viewports.length,
    results: [] as ViewportResult[],
  }

  await page.addInitScript(() => {
    let cumulativeLayoutShift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!shift.hadRecentInput) cumulativeLayoutShift += shift.value ?? 0
      }
      ;(window as typeof window & { __syreCls?: number }).__syreCls = cumulativeLayoutShift
    }).observe({ type: 'layout-shift', buffered: true })
  })

  for (const viewport of viewports) {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []
    const failedRequests: string[] = []
    const failedResponses: string[] = []
    const onConsole = (message: ConsoleMessage) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    }
    const onPageError = (error: Error) => pageErrors.push(error.message)
    const onRequestFailed = (request: Request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`)
    const onResponse = (response: Response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`)
    }

    page.on('console', onConsole)
    page.on('pageerror', onPageError)
    page.on('requestfailed', onRequestFailed)
    page.on('response', onResponse)

    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page).toHaveTitle('SYRE — A pursuit of response')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()

    await page.keyboard.press('Tab')
    const skipLinkFocused = await page.locator('.skip-link').evaluate((element) => element === document.activeElement)
    expect(skipLinkFocused).toBe(true)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main-content$/)

    const internalTargets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => ({
      href: link.getAttribute('href') ?? '',
      exists: Boolean(document.querySelector(link.getAttribute('href') ?? 'invalid')),
    })))
    expect(internalTargets.every(({ exists }) => exists)).toBe(true)

    let menuBehavior: ViewportResult['menuBehavior'] = 'not-applicable'
    if (viewport.width <= 760) {
      const menuTrigger = page.getByRole('button', { name: 'Menu', exact: true })
      await menuTrigger.click()
      await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true')
      const dialog = page.getByRole('dialog', { name: 'SYRE' })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.getByRole('link', { name: /Start a frame brief/ })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(menuTrigger).toBeFocused()
      await menuTrigger.click()
      await dialog.getByRole('link', { name: /FAQ/ }).click()
      await expect(dialog).toBeHidden()
      await expect(page).toHaveURL(/#faq$/)
      menuBehavior = 'passed'
    } else {
      await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'FAQ' }).click()
      await expect(page).toHaveURL(/#faq$/)
    }

    // FAQ - scope to the main #faq section
    const faqSection = page.locator('#faq')
    const faq = faqSection.locator('details').filter({ hasText: 'How long from brief to frame?' })
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    await expect(faq.getByText(/made to order/)).toBeVisible()

    // Threadline brief
    const briefSection = page.locator('#brief')
    await briefSection.scrollIntoViewIfNeeded()

    // Step 1: Ride Intent
    await expect(page.getByRole('heading', { name: 'How do you plan to ride' })).toBeVisible()
    await page.locator('label.option-card').filter({ hasText: /Endurance/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2: Geometry
    await expect(page.getByRole('heading', { name: 'What matters most' })).toBeVisible()
    await page.locator('label.option-card').filter({ hasText: /Balanced/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Finish
    await expect(page.locator('legend').filter({ hasText: 'Pick colours and finish type' })).toBeVisible()
    await page.locator('label.option-card').filter({ hasText: /Raw carbon/ }).click()
    // Select a swatch
    await page.getByRole('button', { name: /Sakura Pink/ }).click()

    // Generate
    await page.getByRole('button', { name: 'Generate brief' }).click()

    // Verify output
    await expect(page.locator('.brief-output__text')).toBeVisible()
    await expect(page.locator('.brief-output__text')).toContainText('Selection: endurance')
    await expect(page.locator('.brief-output__text')).toContainText('Selection: balanced')
    await expect(page.locator('.brief-output__text')).toContainText('Type: raw')

    await page.waitForTimeout(50)
    const accessibility = await new AxeBuilder({ page }).analyze()
    const horizontalOverflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))
    const brokenAssets = await page.locator('img').evaluateAll((images) => images
      .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
      .map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src))
    const clippedControls = await page.locator('a:visible, button:visible, summary:visible, textarea:visible').evaluateAll((elements) => elements
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
      })
      .map((element) => `${element.tagName.toLowerCase()}:${(element.textContent ?? '').trim().slice(0, 60)}`))
    const cumulativeLayoutShift = await page.evaluate(() => (window as typeof window & { __syreCls?: number }).__syreCls ?? 0)

    expect(accessibility.violations).toEqual([])
    expect(horizontalOverflow).toBeLessThanOrEqual(1)
    expect(brokenAssets).toEqual([])
    expect(clippedControls).toEqual([])
    expect(cumulativeLayoutShift).toBeLessThanOrEqual(0.1)
    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])
    expect(failedRequests).toEqual([])
    expect(failedResponses).toEqual([])

    await page.evaluate(() => {
      window.scrollTo(0, 0)
      document.querySelectorAll('textarea').forEach((textarea) => textarea.setSelectionRange(0, 0))
      window.getSelection()?.removeAllRanges()
      ;(document.activeElement as HTMLElement | null)?.blur()
    })
    const screenshot = `evidence/${viewport.name}.png`
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })

    report.results.push({
      viewport: viewport.name,
      dimensions: { width: viewport.width, height: viewport.height },
      url: page.url(),
      title: await page.title(),
      screenshot,
      accessibilityViolations: accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
      consoleErrors,
      pageErrors,
      failedRequests,
      failedResponses,
      brokenAssets,
      horizontalOverflow,
      clippedControls,
      cumulativeLayoutShift,
      skipLinkFocused,
      menuBehavior,
      faqBehavior: 'passed',
      briefBehavior: 'passed',
    })

    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    page.off('requestfailed', onRequestFailed)
    page.off('response', onResponse)
  }

  await writeFile(path.join(evidenceDirectory, 'smoke-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
})

test('preserves SYRE_C1_ nonce through branch/back navigation and generates deterministic brief', async ({ page }) => {
  test.setTimeout(120_000)

  const nonce = `SYRE_C1_${Date.now()}`
  await page.goto(`/?nonce=${nonce}`, { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('SYRE — A pursuit of response')

  // Step 1: Ride Intent
  await page.locator('label.option-card').filter({ hasText: /Climbing/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 2: Geometry
  await expect(page.getByRole('heading', { name: 'What matters most' })).toBeVisible()
  await page.locator('label.option-card').filter({ hasText: /Sharp handling/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 3: Finish
  await expect(page.locator('legend').filter({ hasText: 'Pick colours and finish type' })).toBeVisible()
  await page.locator('label.option-card').filter({ hasText: /Raw carbon/ }).click()
  await page.getByRole('button', { name: /Sakura Pink/ }).click()

  // Generate first brief
  await page.getByRole('button', { name: 'Generate brief' }).click()
  await expect(page.locator('.brief-output__text')).toBeVisible()
  await expect(page.locator('.brief-output__text')).toContainText(`Nonce: ${nonce}`)
  await expect(page.locator('.brief-output__text')).toContainText('Selection: climbing')
  await expect(page.locator('.brief-output__text')).toContainText('Selection: sharp')

  // Back to step 1 via "Start a new brief"
  await page.getByRole('button', { name: 'Start a new brief' }).click()

  // Go through steps again with different selections
  await page.locator('label.option-card').filter({ hasText: /Endurance/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('label.option-card').filter({ hasText: /Comfort-forward/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('label.option-card').filter({ hasText: /Solid paint/ }).click()

  // Generate second brief — nonce must persist
  await page.getByRole('button', { name: 'Generate brief' }).click()
  await expect(page.locator('.brief-output__text')).toContainText(`Nonce: ${nonce}`)
  await expect(page.locator('.brief-output__text')).toContainText('Selection: endurance')
  await expect(page.locator('.brief-output__text')).toContainText('Selection: comfort')

  // Now verify back+forward doesn't break state
  await page.getByRole('button', { name: 'Start a new brief' }).click()
  await page.locator('label.option-card').filter({ hasText: /Mixed terrain/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Back to step 1 — state must be preserved
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.locator('label.option-card').filter({ hasText: /Mixed terrain/ }).locator('input[type="radio"]')).toBeChecked()

  // Forward again
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('label.option-card').filter({ hasText: /Balanced/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Generate — nonce still present across branch/back flow
  await page.getByRole('button', { name: 'Generate brief' }).click()
  await expect(page.locator('.brief-output__text')).toContainText(`Nonce: ${nonce}`)
  await expect(page.locator('.brief-output__text')).toContainText('Selection: gravel')
  await expect(page.locator('.brief-output__text')).toContainText('Selection: balanced')

  // Accessibility check on final state
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})
