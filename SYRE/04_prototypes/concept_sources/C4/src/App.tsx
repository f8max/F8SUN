import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildBrief,
  CARD_DEFINITIONS,
  createInitialCards,
  generateNonce,
  PALETTE_COLOURS,
  SITE_CONTENT,
  type CardId,
  type CardState,
} from './content/atelierContent'
import { BrandMark, ChevronDownIcon, ChevronUpIcon, CopyIcon, DownloadIcon, FrameOutline } from './components/Icons'

function Logo() {
  return (
    <a className="logo" href="#" aria-label={SITE_CONTENT.chrome.homeLabel}>
      <BrandMark className="logo__mark" />
      <span>{SITE_CONTENT.brand}</span>
    </a>
  )
}

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <div className="site-header__title">
          <h1>{SITE_CONTENT.header.title}</h1>
          <p>{SITE_CONTENT.header.subtitle}</p>
        </div>
      </div>
    </header>
  )
}

function ColourPalette({ selected, onSelect }: { selected: string; onSelect: (colour: string) => void }) {
  const listboxRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(() => PALETTE_COLOURS.indexOf(selected))

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let next = focusedIndex
      const cols = 5
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          next = Math.min(focusedIndex + 1, PALETTE_COLOURS.length - 1)
          break
        case 'ArrowLeft':
          event.preventDefault()
          next = Math.max(focusedIndex - 1, 0)
          break
        case 'ArrowDown':
          event.preventDefault()
          next = Math.min(focusedIndex + cols, PALETTE_COLOURS.length - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          next = Math.max(focusedIndex - cols, 0)
          break
        case 'Home':
          event.preventDefault()
          next = 0
          break
        case 'End':
          event.preventDefault()
          next = PALETTE_COLOURS.length - 1
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          onSelect(PALETTE_COLOURS[focusedIndex])
          return
        default:
          return
      }
      setFocusedIndex(next)
      const el = listboxRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)
      el?.focus()
    },
    [focusedIndex, onSelect],
  )

  return (
    <div
      ref={listboxRef}
      className="colour-palette"
      role="listbox"
      aria-label="Colour palette"
      aria-activedescendant={selected ? `colour-${selected.replace('#', '')}` : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {PALETTE_COLOURS.map((colour, index) => {
        const isSelected = colour === selected
        const isDark = ['#0D1213', '#0A0608', '#181E20', '#2A3033', '#332C30', '#3A3D33', '#4A4035', '#3A3530', '#2D3338', '#343330'].includes(colour)
        return (
          <button
            key={colour}
            id={`colour-${colour.replace('#', '')}`}
            className={`colour-swatch${isSelected ? ' colour-swatch--selected' : ''}`}
            role="option"
            aria-selected={isSelected}
            aria-label={`${colour}${isSelected ? ' — selected' : ''}`}
            data-index={index}
            style={{ backgroundColor: colour }}
            type="button"
            onClick={() => onSelect(colour)}
            tabIndex={-1}
          >
            <span className={`colour-swatch__hex${isDark ? ' colour-swatch__hex--light' : ''}`}>
              {colour}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CardEditor({
  card,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChange,
}: {
  card: CardState
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChange: (value: string) => void
}) {
  const def = CARD_DEFINITIONS.find((d) => d.id === card.id)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(card.value)
  const inputRef = useRef<HTMLTextAreaElement | HTMLSelectElement>(null)

  useEffect(() => {
    setDraft(card.value)
  }, [card.value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = useCallback(() => {
    onChange(draft)
    setEditing(false)
  }, [draft, onChange])

  const handleCancel = useCallback(() => {
    setDraft(card.value)
    setEditing(false)
  }, [card.value])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleCancel()
      }
    },
    [handleCancel],
  )

  if (!def) return null

  const hasValue = card.value.length > 0

  return (
    <div className={`card${editing ? ' card--editing' : ''}`}>
      <div className="card__header">
        <h3 className="card__title">{def.title}</h3>
        <div className="card__controls" role="toolbar" aria-label={`${def.title} controls`}>
          <button
            className="card__move-btn"
            type="button"
            aria-label={`${SITE_CONTENT.controls.moveUp} ${def.title}`}
            onClick={onMoveUp}
            disabled={isFirst}
          >
            <ChevronUpIcon />
          </button>
          <button
            className="card__move-btn"
            type="button"
            aria-label={`${SITE_CONTENT.controls.moveDown} ${def.title}`}
            onClick={onMoveDown}
            disabled={isLast}
          >
            <ChevronDownIcon />
          </button>
          {!editing && (
            <button
              className="card__edit-btn"
              type="button"
              aria-label={`${SITE_CONTENT.controls.editLabel} ${def.title}`}
              onClick={() => setEditing(true)}
            >
              {SITE_CONTENT.controls.editLabel}
            </button>
          )}
        </div>
      </div>
      <p className="card__desc">{def.description}</p>

      {editing ? (
        <div className="card__edit-area">
          {def.type === 'text' && (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="card__input"
              rows={3}
              value={draft}
              placeholder={def.placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={def.title}
            />
          )}
          {def.type === 'select' && def.options && (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              className="card__select"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={def.title}
            >
              {def.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
          {def.type === 'palette' && (
            <ColourPalette selected={draft} onSelect={(c) => { setDraft(c); onChange(c); setEditing(false) }} />
          )}
          {def.type !== 'palette' && (
            <div className="card__edit-actions">
              <button className="card__save-btn" type="button" onClick={handleSave}>
                {SITE_CONTENT.controls.saveLabel}
              </button>
              <button className="card__cancel-btn" type="button" onClick={handleCancel}>
                {SITE_CONTENT.controls.cancelLabel}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card__value" onClick={() => setEditing(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditing(true) } }}>
          {hasValue ? (
            def.type === 'palette' ? (
              <span className="card__colour-preview">
                <span className="card__colour-dot" style={{ backgroundColor: card.value }} aria-hidden="true" />
                {card.value}
              </span>
            ) : (
              <span>{card.value}</span>
            )
          ) : (
            <span className="card__placeholder">{def.placeholder}</span>
          )}
        </div>
      )}
    </div>
  )
}

function FrameTreatment({ colour }: { colour: string }) {
  const resolvedColour = colour || PALETTE_COLOURS[0]
  return (
    <div className="treatment" aria-label={SITE_CONTENT.treatment.heading}>
      <h3>{SITE_CONTENT.treatment.heading}</h3>
      <div className="treatment__frame" style={{ color: resolvedColour }}>
        <FrameOutline />
      </div>
      <div className="treatment__swatch" aria-hidden="true">
        <span className="treatment__swatch-dot" style={{ backgroundColor: resolvedColour }} />
        <span>{resolvedColour}</span>
      </div>
      <p className="treatment__note">{SITE_CONTENT.treatment.note}</p>
    </div>
  )
}

function BriefPreview({ brief, colour }: { brief: string; colour: string }) {
  const [status, setStatus] = useState('')
  const previewRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(brief)
      setStatus(SITE_CONTENT.brief.copiedMessage)
    } catch {
      setStatus(SITE_CONTENT.brief.copiedFallback)
      previewRef.current?.focus()
      previewRef.current?.select()
    }
  }, [brief])

  const handleDownload = useCallback(() => {
    const blob = new Blob([brief], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = SITE_CONTENT.brief.downloadFilename
    anchor.click()
    URL.revokeObjectURL(url)
  }, [brief])

  return (
    <div className="brief-panel">
      <div className="brief-panel__header">
        <h3>{SITE_CONTENT.brief.heading}</h3>
        <div className="brief-panel__actions">
          <button className="brief-panel__action" type="button" onClick={handleCopy} aria-label={SITE_CONTENT.brief.copyLabel}>
            <CopyIcon />
            <span>{SITE_CONTENT.brief.copyLabel}</span>
          </button>
          <button className="brief-panel__action" type="button" onClick={handleDownload} aria-label={SITE_CONTENT.brief.downloadLabel}>
            <DownloadIcon />
            <span>{SITE_CONTENT.brief.downloadLabel}</span>
          </button>
        </div>
      </div>
      <p className="brief-panel__status" role="status" aria-live="polite">
        {status}
      </p>
      <textarea
        ref={previewRef}
        className="brief-panel__preview"
        rows={14}
        readOnly
        value={brief}
        aria-label={SITE_CONTENT.brief.heading}
      />
      <FrameTreatment colour={colour} />
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <Logo />
        <p>{SITE_CONTENT.chrome.footerNote}</p>
        <span>{SITE_CONTENT.chrome.copyright}</span>
      </div>
    </footer>
  )
}

export function App() {
  const [cards, setCards] = useState<CardState[]>(() => createInitialCards())
  const [nonce] = useState(() => generateNonce())

  const orderedCards = useMemo(() => [...cards].sort((a, b) => a.order - b.order), [cards])

  const colourCard = cards.find((c) => c.id === 'colour')
  const selectedColour = colourCard?.value || PALETTE_COLOURS[0]

  const brief = useMemo(() => buildBrief(cards, nonce), [cards, nonce])

  const handleChange = useCallback((cardId: CardId, value: string) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, value } : c)))
  }, [])

  const handleMoveUp = useCallback((cardId: CardId) => {
    setCards((prev) => {
      const current = prev.find((c) => c.id === cardId)
      if (!current || current.order === 0) return prev
      const target = prev.find((c) => c.order === current.order - 1)
      if (!target) return prev
      return prev.map((c) => {
        if (c.id === cardId) return { ...c, order: c.order - 1 }
        if (c.id === target.id) return { ...c, order: c.order + 1 }
        return c
      })
    })
  }, [])

  const handleMoveDown = useCallback((cardId: CardId) => {
    setCards((prev) => {
      const current = prev.find((c) => c.id === cardId)
      if (!current || current.order === prev.length - 1) return prev
      const target = prev.find((c) => c.order === current.order + 1)
      if (!target) return prev
      return prev.map((c) => {
        if (c.id === cardId) return { ...c, order: c.order + 1 }
        if (c.id === target.id) return { ...c, order: c.order - 1 }
        return c
      })
    })
  }, [])

  const maxOrder = cards.length - 1

  return (
    <>
      <a className="skip-link" href="#main-content">{SITE_CONTENT.chrome.skipLink}</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div className="studio">
          <section className="studio__cards" aria-label={SITE_CONTENT.sections.cards}>
            <h2 className="studio__heading">{SITE_CONTENT.sections.cards}</h2>
            {orderedCards.map((card) => (
              <CardEditor
                key={card.id}
                card={card}
                isFirst={card.order === 0}
                isLast={card.order === maxOrder}
                onMoveUp={() => handleMoveUp(card.id)}
                onMoveDown={() => handleMoveDown(card.id)}
                onChange={(value: string) => handleChange(card.id, value)}
              />
            ))}
          </section>
          <section className="studio__preview" aria-label={SITE_CONTENT.sections.preview}>
            <BriefPreview brief={brief} colour={selectedColour} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
