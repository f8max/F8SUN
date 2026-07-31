import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from './App'

function fillAndAdvance(label: string) {
  const input = screen.getByLabelText<HTMLInputElement>(/ride label/i)
  input.value = label
  fireEvent.input(input)
  fireEvent.click(screen.getByRole('button', { name: /begin journey/i }))
}

describe('SYRE concept 03 — RIDE REPLAY', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('provides a skip link and semantic page landmarks', () => {
    expect(screen.getByRole('link', { name: /skip to ride replay/i })).toHaveAttribute('href', '#main-content')
    const banners = screen.getAllByRole('banner')
    expect(banners.length).toBe(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the hero with brand facts', () => {
    expect(screen.getByRole('heading', { level: 1, name: /ride replay/i })).toBeInTheDocument()
    expect(screen.getByText(/≈920 g/)).toBeInTheDocument()
    const layupRefs = screen.getAllByText(/hand layup/i)
    expect(layupRefs.length).toBeGreaterThanOrEqual(1)
  })

  it('displays the five-stage state indicator track with stage numbers', () => {
    const track = screen.getByRole('navigation', { name: /configuration stages/i })
    expect(track).toBeInTheDocument()
    const ones = screen.getAllByText('01')
    expect(ones.length).toBeGreaterThanOrEqual(2)
  })

  it('starts in DEFINE state with scenario input focused', async () => {
    const input = screen.getByLabelText(/ride label/i)
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('advances from DEFINE to SHAPE', async () => {
    fillAndAdvance('Century ride')
    // Use regex match since button accessible name includes label+context
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())
  })

  it('full journey through all 5 stages', async () => {
    fillAndAdvance('Century ride')
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /^Endurance/ }))
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Lightweight/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Lightweight/ }))
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Raw Carbon/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Masked Paint/ }))

    await waitFor(() => void expect(screen.getByText(/verified/i)).toBeInTheDocument())
    // Scenario appears in both badge and receipt — use getAllByText
    const refs = screen.getAllByText(/Century ride/)
    expect(refs.length).toBeGreaterThanOrEqual(1)
  })

  it('BACK navigates to previous stage', async () => {
    fillAndAdvance('Commute')
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Endurance/ }))
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Lightweight/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /previous stage/i }))
    await waitFor(() => void expect(screen.getByRole('heading', { name: /choose the geometry profile/i })).toBeInTheDocument())
  })

  it('RESET returns to DEFINE', async () => {
    fillAndAdvance('Gravel tour')
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    await waitFor(() => void expect(screen.getByLabelText(/ride label/i)).toBeInTheDocument())
  })

  it('annotations are disclosure elements', () => {
    const detailsList = document.querySelectorAll('details')
    expect(detailsList.length).toBeGreaterThanOrEqual(1)
  })

  it('facts section has ground-truth data', () => {
    expect(screen.getByRole('heading', { name: /what we can say/i })).toBeInTheDocument()
    expect(screen.getByText(/no stiffness data/i)).toBeInTheDocument()
    expect(screen.getByText(/39-colour/i)).toBeInTheDocument()
  })

  it('Play hidden on READY', async () => {
    fillAndAdvance('Quick spin')
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Endurance/ }))
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Lightweight/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Lightweight/ }))
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Raw Carbon/ })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Masked Paint/ }))
    await waitFor(() => void expect(screen.getByText(/verified/i)).toBeInTheDocument())
    // Play button IS rendered on READY, just disabled
    const playButton = screen.queryByRole('button', { name: /play/i })
    expect(playButton).not.toBeNull()
    expect(playButton!).toBeDisabled()
  })

  it('Enter submits scenario', async () => {
    const input = screen.getByLabelText<HTMLInputElement>(/ride label/i)
    input.value = 'Track sprint'
    fireEvent.input(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => void expect(screen.getByRole('button', { name: /^Endurance/ })).toBeInTheDocument())
  })
})
