import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from './App'
import { SITE_CONTENT } from './content/atelierContent'

describe('ATELIER frame brief studio', () => {
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
    expect(screen.getByRole('link', { name: /skip to the frame brief studio/i })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders all six configurator cards with headings', () => {
    expect(screen.getByRole('heading', { name: /frame brief studio/i })).toBeInTheDocument()
    expect(screen.getByText('Ride intent')).toBeInTheDocument()
    expect(screen.getByText('Geometry')).toBeInTheDocument()
    expect(screen.getByText('Layup')).toBeInTheDocument()
    expect(screen.getByText('Finish')).toBeInTheDocument()
    expect(screen.getByText('Colour')).toBeInTheDocument()
    expect(screen.getByText('Next step')).toBeInTheDocument()
    expect(screen.getByText(SITE_CONTENT.treatment.note)).toBeInTheDocument()
    expect(screen.getByText(SITE_CONTENT.chrome.footerNote)).toBeInTheDocument()
  })

  it('allows inline editing of a card with Save and Cancel', async () => {
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons.length).toBeGreaterThanOrEqual(4)

    // Edit Ride intent
    const rideEdit = screen.getByRole('button', { name: /edit ride intent/i })
    fireEvent.click(rideEdit)

    const textarea = screen.getByLabelText('Ride intent') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    fireEvent.change(textarea, { target: { value: 'Endurance road riding' } })

    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.queryByLabelText('Ride intent')).not.toBeInTheDocument()
    expect(screen.getByText('Endurance road riding')).toBeInTheDocument()
  })

  it('allows colour selection from the palette', async () => {
    // Find colour card and edit it
    const colourEdit = screen.getByRole('button', { name: /edit colour/i })
    fireEvent.click(colourEdit)

    // Palette should be visible
    const swatches = screen.getAllByRole('option')
    expect(swatches.length).toBeGreaterThanOrEqual(30)

    // Click a different colour
    const targetSwatch = screen.getByRole('option', { name: /#FFD430/ })
    fireEvent.click(targetSwatch)

    // Colour should be selected — find the colour preview in the card
    const colourPreviews = screen.getAllByText('#FFD430')
    expect(colourPreviews.length).toBeGreaterThanOrEqual(1)
    expect(colourPreviews[0]).toBeInTheDocument()
  })

  it('moves cards up and down', async () => {
    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    // First card should be 'Ride intent' initially
    expect(cards[0]).toBe('Ride intent')

    // Move Ride intent down
    const moveDownButtons = screen.getAllByRole('button', { name: /move down/i })
    fireEvent.click(moveDownButtons[0])

    // After reorder, verify the DOM order changed
    const cardsAfter = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(cardsAfter[0]).not.toBe('Ride intent')
  })

  it('displays the live brief with nonce', () => {
    const briefTextarea = screen.getByLabelText(SITE_CONTENT.brief.heading)
    const briefValue = briefTextarea.getAttribute('value') || (briefTextarea as HTMLTextAreaElement).value
    expect(briefValue).toContain('SYRE C4 ATELIER — Frame Brief')
    expect(briefValue).toContain('Nonce: SYRE_C4_')
    expect(briefValue).toContain('ORCHESTRA_SYRE_C4_20260729_A')
    expect(briefValue).toContain('Ride intent:')
    expect(briefValue).toContain('Layup: Hand layup')
    expect(briefValue).toContain('Finish: Raw carbon')
  })

  it('copies the brief to clipboard', async () => {
    const copyButton = screen.getByRole('button', { name: /copy brief/i })
    fireEvent.click(copyButton)

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    const copiedText = writeText.mock.calls[0][0] as string
    expect(copiedText).toContain('SYRE C4 ATELIER — Frame Brief')
    expect(copiedText).toContain('Nonce: SYRE_C4_')

    expect(screen.getByRole('status')).toHaveTextContent(/copied to clipboard/i)
  })

  it('shows fallback message when clipboard fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    const copyButton = screen.getByRole('button', { name: /copy brief/i })
    fireEvent.click(copyButton)

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copy from the preview/i))
  })

  it('downloads the brief as a text file', async () => {
    // Mock URL.createObjectURL and anchor click
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi.fn()
    const origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickSpy })
        Object.defineProperty(el, 'download', { value: '', writable: true })
        Object.defineProperty(el, 'href', { value: '', writable: true })
      }
      return el
    })

    const downloadButton = screen.getByRole('button', { name: /download brief/i })
    fireEvent.click(downloadButton)

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
  })
})
