import AxeBuilder from '@axe-core/playwright'
import { expect, test, type ConsoleMessage, type Request, type Response } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { authorizedPublicOrigin } from '../../playwright.public.config'

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800 },
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
  requests: number
  accessibilityViolations: Array<{ id: string; impact: string | null; nodes: number }>
  consoleErrors: string[]
  pageErrors: string[]
  failedRequests: string[]
  failedResponses: string[]
  blockedCrossOriginRequests: string[]
  nonGetRequests: string[]
  redirects: string[]
  brokenAssets: string[]
  horizontalOverflow: number
  clippedControls: string[]
  cumulativeLayoutShift: number
  skipLinkFocused: boolean
  menuBehavior: 'passed' | 'not-applicable'
  faqBehavior: 'passed'
  briefBehavior: 'passed'
}

test('validates the exact public release across all required viewports', async ({ page }) => {
  test.setTimeout(240_000)
  const evidenceDirectory = path.resolve('evidence/public')
  await mkdir(evidenceDirectory, { recursive: true })

  let blockedCrossOriginRequests: string[] = []
  await page.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.origin !== authorizedPublicOrigin) {
      blockedCrossOriginRequests.push(route.request().url())
      await route.abort('blockedbyclient')
      return
    }
    await route.continue()
  })

  const report = {
    generatedBy: 'Playwright + axe-core',
    target: 'authorized public Cloud Run origin',
    authorizedOrigin: authorizedPublicOrigin,
    requestPolicy: 'Browser requests limited to exact origin and same-origin assets; no server form submission',
    release: {
      branch: 'codex/syre-foundation-20260729',
      commit: '6dfc0cbf4fb0b6a848db75b0c7fabdf342c34922',
      tree: '48fe8474cec8800ae64a560ec2f37dab6748f681',
      revision: 'syre-web-6dfc0cbf',
      imageDigest: 'sha256:c0fcd4b51a06f76f609f109f23a0046ba4a82120ee89f95036f363b23abadf00',
    },
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
    const nonGetRequests: string[] = []
    const redirects: string[] = []
    const requests: string[] = []
    blockedCrossOriginRequests = []

    const onConsole = (message: ConsoleMessage) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    }
    const onPageError = (error: Error) => pageErrors.push(error.message)
    const onRequest = (request: Request) => {
      requests.push(request.url())
      if (request.method() !== 'GET') nonGetRequests.push(`${request.method()} ${request.url()}`)
      if (new URL(request.url()).origin !== authorizedPublicOrigin) blockedCrossOriginRequests.push(request.url())
    }
    const onRequestFailed = (request: Request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`)
    const onResponse = (response: Response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`)
      if (response.request().redirectedFrom()) redirects.push(`${response.request().redirectedFrom()?.url()} -> ${response.url()}`)
    }

    page.on('console', onConsole)
    page.on('pageerror', onPageError)
    page.on('request', onRequest)
    page.on('requestfailed', onRequestFailed)
    page.on('response', onResponse)

    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
    await page.goto('/', { waitUntil: 'networkidle' })

    expect(new URL(page.url()).origin).toBe(authorizedPublicOrigin)
    await expect(page).toHaveTitle('SYRE — Work, in rhythm')
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
      const dialog = page.getByRole('dialog', { name: 'Navigate SYRE' })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.getByRole('link', { name: /Build a starting brief/ })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(menuTrigger).toBeFocused()
      await menuTrigger.click()
      await dialog.getByRole('link', { name: /Why SYRE/ }).click()
      await expect(dialog).toBeHidden()
      await expect(page).toHaveURL(/#why$/)
      menuBehavior = 'passed'
    } else {
      await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'FAQ' }).click()
      await expect(page).toHaveURL(/#faq$/)
    }

    const faq = page.locator('details').filter({ hasText: 'What is SYRE?' })
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    await expect(faq.getByText(/focused approach/)).toBeVisible()

    const requestCountBeforeBrief = requests.length
    const submit = page.getByRole('button', { name: 'Create and copy the brief' })
    await submit.click()
    await expect(page.getByRole('status')).toContainText('Add the outcome')
    await expect(page.getByLabel('What outcome are you trying to move?')).toBeFocused()
    await page.getByLabel('What outcome are you trying to move?').fill('Choose the next meaningful phase')
    await page.getByLabel('What context should stay attached?').fill('Constraints and open questions')
    await submit.click()
    await expect(page.getByLabel('Your working brief')).toHaveValue(/Outcome to move: Choose the next meaningful phase/)
    await expect(page.getByRole('status')).toContainText(/Brief created/)
    expect(requests.length).toBe(requestCountBeforeBrief)

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
    expect(blockedCrossOriginRequests).toEqual([])
    expect(nonGetRequests).toEqual([])
    expect(redirects).toEqual([])

    await page.evaluate(() => {
      window.scrollTo(0, 0)
      document.querySelectorAll('textarea').forEach((textarea) => textarea.setSelectionRange(0, 0))
      window.getSelection()?.removeAllRanges()
      ;(document.activeElement as HTMLElement | null)?.blur()
    })
    const screenshot = `evidence/public/${viewport.name}.png`
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })

    report.results.push({
      viewport: viewport.name,
      dimensions: { width: viewport.width, height: viewport.height },
      url: page.url(),
      title: await page.title(),
      screenshot,
      requests: requests.length,
      accessibilityViolations: accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
      consoleErrors,
      pageErrors,
      failedRequests,
      failedResponses,
      blockedCrossOriginRequests,
      nonGetRequests,
      redirects,
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
    page.off('request', onRequest)
    page.off('requestfailed', onRequestFailed)
    page.off('response', onResponse)
  }

  await writeFile(path.join(evidenceDirectory, 'playwright-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
})
