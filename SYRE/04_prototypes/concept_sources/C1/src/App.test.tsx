import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { App } from './App'

describe('SYRE frame brand experience', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<App />)
  })

  it('provides a skip link and semantic page landmarks', () => {
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the complete page flow with ordered headings', () => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /every ply has a reason/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tuned, not just made/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /how a frame gets its skin/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /frame brief/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /straight answers/i })).toBeInTheDocument()
  })

  it('exposes complete primary/footer navigation and no broken in-page targets', () => {
    const primaryNavigation = screen.getByRole('navigation', { name: /primary navigation/i })
    const footerNavigation = screen.getByRole('navigation', { name: /footer navigation/i })

    expect(within(primaryNavigation).getByRole('link', { name: 'Engineering' })).toHaveAttribute('href', '#engineering')
    expect(within(primaryNavigation).getByRole('link', { name: 'Layup' })).toHaveAttribute('href', '#layup')
    expect(within(primaryNavigation).getByRole('link', { name: 'Finish' })).toHaveAttribute('href', '#finish')
    expect(within(primaryNavigation).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '#faq')
    expect(within(footerNavigation).getByRole('link', { name: 'Engineering' })).toHaveAttribute('href', '#engineering')

    for (const link of screen.getAllByRole('link')) {
      const href = link.getAttribute('href')
      if (href?.startsWith('#')) expect(document.querySelector(href)).not.toBeNull()
    }
  })

  it('opens a focus-managed mobile menu and returns focus on Escape', async () => {
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'SYRE' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(within(dialog).getByRole('button', { name: /close navigation menu/i })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.body.style.overflow).toBe('')
  })

  it('expands FAQ answers with native disclosure controls', () => {
    const faqSection = document.getElementById('faq')!
    const question = within(faqSection).getByText('How long from brief to frame?').closest('summary')
    const details = question?.closest('details')
    expect(details).not.toHaveAttribute('open')
    fireEvent.click(question!)
    expect(details).toHaveAttribute('open')
    expect(within(faqSection).getByText(/made to order/)).toBeVisible()
  })

  it('advances through Threadline steps 1→2→3 and generates a brief', async () => {
    // Step 1: Ride Intent
    fireEvent.click(screen.getByRole('radio', { name: /Endurance/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    // Step 2: Geometry
    await waitFor(() => expect(screen.getByRole('radio', { name: /Balanced/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('radio', { name: /Balanced/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    // Step 3: Finish
    await waitFor(() => expect(screen.getByRole('radio', { name: /Raw carbon/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('radio', { name: /Raw carbon/ }))
    fireEvent.click(screen.getByRole('button', { name: /Sakura Pink/i }))

    // Generate
    fireEvent.click(screen.getByRole('button', { name: 'Generate brief' }))

    // Verify output is visible and contains the right content
    await waitFor(() => {
      const briefText = document.querySelector('.brief-output__text')
      expect(briefText).not.toBeNull()
      expect(briefText!.textContent).toContain('Selection: endurance')
      expect(briefText!.textContent).toContain('Selection: balanced')
      expect(briefText!.textContent).toContain('Type: raw')
    })
  })

  it('allows going back from step 2 to step 1 preserving state', async () => {
    fireEvent.click(screen.getByRole('radio', { name: /Climbing/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByRole('radio', { name: /Sharp handling/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => expect(screen.getByRole('radio', { name: /Climbing/ })).toBeInTheDocument())
    const climbingRadio = screen.getByRole('radio', { name: /Climbing/ }) as HTMLInputElement
    expect(climbingRadio.checked).toBe(true)
  })

  it('shows a progress indicator that updates with each step', async () => {
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '1')

    fireEvent.click(screen.getByRole('radio', { name: /Fast road/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2'))
  })
})
