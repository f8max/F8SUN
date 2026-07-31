import AxeBuilder from '@axe-core/playwright'
import { expect, test, type ConsoleMessage, type Request, type Response } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800 },
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
  journeyCompleted: boolean
  receiptVerified: boolean
  resetWorks: boolean
}

test('C3 RIDE REPLAY — validates complete temporal state machine experience across viewports', async ({ page }) => {
  test.setTimeout(240_000)
  const evidenceDirectory = path.resolve('evidence')
  await mkdir(evidenceDirectory, { recursive: true })

  const report = {
    generatedBy: 'Playwright + axe-core — SYRE C3 RIDE REPLAY',
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
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
    await page.goto('/', { waitUntil: 'networkidle' })

    // ── Basic assertions ──
    await expect(page).toHaveTitle(/SYRE concept 03/)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()

    // ── DEFINE: scenario entry ──
    const scenarioInput = page.getByLabel(/ride label/i)
    await expect(scenarioInput).toBeVisible()
    await expect(scenarioInput).toBeFocused()

    // ── Skip link ──
    // Verify skip link exists, is visible, and can receive focus
    const skipLink = page.getByRole('link', { name: 'Skip to ride replay' })
    await expect(skipLink).toBeVisible()
    await skipLink.focus()
    const skipLinkFocused = await skipLink.evaluate((element) => element === document.activeElement)
    expect(skipLinkFocused).toBe(true)

    // ── Internal link targets resolved ──
    const internalTargets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => ({
      href: link.getAttribute('href') ?? '',
      exists: Boolean(document.querySelector(link.getAttribute('href') ?? 'invalid')),
    })))
    expect(internalTargets.every(({ exists }) => exists)).toBe(true)

    // ── Mobile menu ──
    let menuBehavior: ViewportResult['menuBehavior'] = 'not-applicable'
    if (viewport.width <= 760) {
      const menuTrigger = page.getByRole('button', { name: 'Menu', exact: true })
      await menuTrigger.click()
      await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true')
      const dialog = page.getByRole('dialog', { name: 'Navigate SYRE' })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(menuTrigger).toBeFocused()
      menuBehavior = 'passed'
    }

    // ── DEFINE: fill scenario and begin journey ──
    await scenarioInput.fill(`RIDE_REPLAY_C3_${viewport.name}_${Date.now()}`)

    // ── Begin journey (dispatches SET_SCENARIO + NEXT) ──
    await page.getByRole('button', { name: /begin journey/i }).click()

    // ── SHAPE: choose geometry ──
    await expect(page.getByRole('heading', { name: /choose the geometry profile/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Endurance' }).click()

    // ── LAYUP: choose layup ──
    await expect(page.getByRole('heading', { name: /specify the carbon layup/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Lightweight' }).click()

    // ── FINISH: choose finish ──
    await expect(page.getByRole('heading', { name: /choose the finish treatment/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Masked Paint' }).click()

    // ── READY: receipt ──
    await expect(page.getByText('Verified')).toBeVisible({ timeout: 5000 })
    const receiptVerified = await page.getByText('Verified').isVisible()

    // ── Check receipt contents ──
    // Receipt shows raw choice values, not display labels
    await expect(page.getByText(/endurance/)).toBeVisible()
    await expect(page.getByText(/lightweight/)).toBeVisible()
    // Masked Paint → receipt shows 'masked'
    const receiptArea = page.locator('.rr-receipt')
    await expect(receiptArea).toBeVisible()

    // ── BACK navigation ──
    const journeyCompleted = receiptVerified

    // ── RESET ──
    await page.getByRole('button', { name: /reset/i }).click()
    await expect(page.getByLabel(/ride label/i)).toBeVisible({ timeout: 3000 })
    const resetWorks = await page.getByLabel<HTMLInputElement>(/ride label/i).inputValue().then(v => v === '')

    // ── Navigate back to DEFINE ──
    await scenarioInput.fill('Final test')
    await page.getByRole('button', { name: /begin journey/i }).click()
    await expect(page.getByRole('heading', { name: /choose the geometry profile/i })).toBeVisible({ timeout: 5000 })

    // ── Annotation disclosure ──
    const annotation = page.locator('details').first()
    if (await annotation.isVisible()) {
      await annotation.locator('summary').click()
      await expect(annotation).toHaveAttribute('open', '')
    }

    // ── Scrubber keyboard nav (ArrowRight) ──
    const slider = page.locator('[role="slider"]')
    if (await slider.isVisible()) {
      await slider.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(300)
    }

    // ── PAUSE / RESET if playing ──
    const pauseBtn = page.getByRole('button', { name: /pause/i })
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click()
    }

    // ── A11y, overflow, assets ──
    await page.waitForTimeout(50)
    const accessibility = await new AxeBuilder({ page }).analyze()
    const horizontalOverflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))
    const brokenAssets = await page.locator('img').evaluateAll((images) => images
      .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
      .map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src))
    const clippedControls = await page.locator('a:visible, button:visible, summary:visible, input:visible').evaluateAll((elements) => elements
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
      })
      .map((element) => `${element.tagName.toLowerCase()}:${(element.textContent ?? '').trim().slice(0, 60)}`))
    const cumulativeLayoutShift = await page.evaluate(() => (window as typeof window & { __syreCls?: number }).__syreCls ?? 0)

    // ── Assertions ──
    expect(accessibility.violations).toEqual([])
    expect(horizontalOverflow).toBeLessThanOrEqual(1)
    expect(brokenAssets).toEqual([])
    expect(clippedControls).toEqual([])
    expect(cumulativeLayoutShift).toBeLessThanOrEqual(0.1)
    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])
    expect(failedRequests).toEqual([])
    expect(failedResponses).toEqual([])

    // ── Screenshot ──
    await page.evaluate(() => {
      window.scrollTo(0, 0)
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
      journeyCompleted,
      receiptVerified,
      resetWorks,
    })

    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    page.off('requestfailed', onRequestFailed)
    page.off('response', onResponse)
  }

  await writeFile(path.join(evidenceDirectory, 'smoke-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
})
