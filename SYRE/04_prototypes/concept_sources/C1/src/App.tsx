import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { siteContent, FINISH_TYPE_OPTIONS, GEOMETRY_PRIORITY_OPTIONS, RIDE_INTENT_OPTIONS } from './content/siteContent'
import { SWATCHES } from './content/swatches'
import type { BriefState } from './content/siteContent'
import { useThreadline } from './hooks/useThreadline'
import { BrandMark } from './components/Icons'

// ── Reusable primitives ──

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`logo${inverse ? ' logo--inverse' : ''}`} href="#top" aria-label={siteContent.chrome.homeLabel}>
      <BrandMark className="logo__mark" />
      <span>{siteContent.brand}</span>
    </a>
  )
}

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <p className={`eyebrow${inverse ? ' eyebrow--inverse' : ''}`}>
      <span aria-hidden="true" />
      {children}
    </p>
  )
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="section-heading">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}

// ── Header ──

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false)
    if (returnFocus) queueMicrotask(() => menuButtonRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const panel = menuPanelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    focusable?.[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return }
      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    const handleResize = () => { if (window.innerWidth > 760) setMenuOpen(false) }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [closeMenu, menuOpen])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav site-nav--desktop" aria-label={siteContent.chrome.primaryNavigationLabel}>
          <div className="site-nav__links">
            {siteContent.navigation.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <a className="nav-cta" href="#brief">{siteContent.chrome.headerAction}</a>
        </nav>
        <button ref={menuButtonRef} className="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <span>{siteContent.chrome.menuLabel}</span>
          <span className="menu-toggle__icon" aria-hidden="true"><i /><i /></span>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu" onMouseDown={(event) => { if (event.target === event.currentTarget) closeMenu(true) }}>
          <div ref={menuPanelRef} className="mobile-menu__panel" id="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
            <div className="mobile-menu__topline">
              <p id="mobile-menu-title">{siteContent.chrome.menuTitle}</p>
              <button type="button" className="menu-close" aria-label={siteContent.chrome.menuCloseLabel} onClick={() => closeMenu(true)}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label={siteContent.chrome.mobileNavigationLabel}>
              {siteContent.navigation.map((item, index) => (
                <a key={item.href} href={item.href} onClick={() => closeMenu(false)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item.label}
                  <span aria-hidden="true">↘</span>
                </a>
              ))}
            </nav>
            <a className="action-link" href="#brief" onClick={() => closeMenu(false)}>{siteContent.chrome.mobileAction}</a>
            <p className="mobile-menu__note">{siteContent.chrome.menuNote}</p>
          </div>
        </div>
      )}
    </header>
  )
}

// ── Hero ──

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__content">
          <Eyebrow>{siteContent.hero.eyebrow}</Eyebrow>
          <h1 id="hero-title">{siteContent.hero.title}<span>{siteContent.hero.accent}</span></h1>
          <p className="hero__lede">{siteContent.hero.body}</p>
          <div className="hero__actions">
            <a className="action-link action-link--dark" href={siteContent.hero.primaryAction.href}>{siteContent.hero.primaryAction.label}</a>
            <a className="quiet-link" href={siteContent.hero.secondaryAction.href}>{siteContent.hero.secondaryAction.label}<span aria-hidden="true">↓</span></a>
          </div>
          <p className="hero__note"><span aria-hidden="true">✦</span>{'~920 g frame · Hand layup · 39 colours'}</p>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__visual-label hero__visual-label--top">{siteContent.hero.visualLabels[0]}</div>
          <FrameSilhouette />
          <div className="hero__visual-label hero__visual-label--bottom">{siteContent.hero.visualLabels[1]}</div>
        </div>
      </div>
      <div className="hero__ticker" aria-hidden="true">
        <div>
          {siteContent.hero.ticker.map((item, index) => (
            <span key={`${item}-${index}`}>{item}{index < siteContent.hero.ticker.length - 1 && <i />}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function FrameSilhouette() {
  return (
    <svg className="frame-silhouette" viewBox="0 0 620 340" role="img" aria-labelledby="frame-title">
      <title id="frame-title">Road bicycle frame silhouette</title>
      <path
        d="M120 70 L270 55 L420 65 L580 50 M120 70 L80 170 L110 310 M580 50 L600 130 L560 310 M270 55 L310 130 L310 260 M420 65 L310 130 M80 170 L310 260 L560 310 M310 130 L310 260"
        fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.18"
      />
      <path
        d="M120 70 L270 55 L420 65 L580 50 M120 70 L80 170 L110 310 M580 50 L600 130 L560 310 M270 55 L310 130 L310 260 M420 65 L310 130 M80 170 L310 260 L560 310 M310 130 L310 260"
        fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Engineering ──

function EngineeringSection() {
  return (
    <section className="engineering-section section" id="engineering" aria-labelledby="engineering-title">
      <div className="container">
        <SectionHeading eyebrow={siteContent.engineering.eyebrow} title={siteContent.engineering.title} body={siteContent.engineering.body} />
        <dl className="spec-list">
          {siteContent.engineering.details.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ── Layup ──

function LayupSection() {
  return (
    <section className="layup-section section" id="layup" aria-labelledby="layup-title">
      <div className="container layup-section__grid">
        <div className="layup-copy">
          <SectionHeading eyebrow={siteContent.layup.eyebrow} title={siteContent.layup.title} body={siteContent.layup.body} />
        </div>
        <dl className="zones-list">
          {siteContent.layup.zones.map((z, i) => (
            <div key={z.zone}>
              <dt><span>{String(i + 1).padStart(2, '0')}</span>{z.zone}</dt>
              <dd>{z.priority}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ── Finish overview ──

function FinishOverviewSection() {
  return (
    <section className="finish-overview section" id="finish" aria-labelledby="finish-overview-title">
      <div className="container">
        <SectionHeading eyebrow="Finish process" title="How a frame gets its skin." body={siteContent.finish.body} />
        <ol className="finish-process-list">
          {siteContent.finish.process.map((p, i) => (
            <li key={p.step}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{p.step}</strong>
                <p>{p.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ── FAQ ──

function FaqSection() {
  return (
    <section className="faq-section section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-section__grid">
        <div className="faq-heading">
          <SectionHeading eyebrow={siteContent.faq.eyebrow} title={siteContent.faq.title} body={siteContent.faq.body} />
        </div>
        <div className="faq-list">
          {siteContent.faq.items.map((item, index) => (
            <details key={item.question}>
              <summary>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.question}</strong>
                <i aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Threadline ──

function ProgressIndicator({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100)
  return (
    <div className="progress-indicator" role="progressbar" aria-label="Brief progress" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} aria-valuetext={`Step ${step} of ${total}`}>
      <div className="progress-indicator__steps">
        {[1, 2, 3].map((s) => (
          <span key={s} className={`progress-indicator__dot${s <= step ? ' progress-indicator__dot--active' : ''}${s === step ? ' progress-indicator__dot--current' : ''}`}>
            <span className="sr-only">{s <= step ? 'completed' : 'upcoming'}: step {s}</span>
          </span>
        ))}
      </div>
      <div className="progress-indicator__track">
        <div className="progress-indicator__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-indicator__label">{siteContent.brief.steps[step === 1 ? 'intent' : step === 2 ? 'geometry' : 'finish'].label}</p>
    </div>
  )
}

function RideIntentStep({
  brief,
  updateBrief,
  onNext,
  onBack,
}: {
  brief: BriefState
  updateBrief: (p: Partial<BriefState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const { steps } = siteContent.brief
  return (
    <div className="threadline-step">
      <h3 className="threadline-step__question">{steps.intent.question}</h3>
      <fieldset className="option-group">
        <legend className="sr-only">{steps.intent.question}</legend>
        {RIDE_INTENT_OPTIONS.map((opt) => (
          <label key={opt.id} className={`option-card${brief.rideIntent === opt.id ? ' option-card--selected' : ''}`}>
            <input
              type="radio"
              name="ride-intent"
              value={opt.id}
              checked={brief.rideIntent === opt.id}
              onChange={() => updateBrief({ rideIntent: opt.id })}
            />
            <span className="option-card__label">{opt.label}</span>
            <span className="option-card__desc">{opt.description}</span>
          </label>
        ))}
      </fieldset>
      <label className="threadline-step__notes">
        <span>{steps.intent.notesLabel}</span>
        <textarea
          rows={2}
          value={brief.rideIntentNotes}
          placeholder={steps.intent.notesPlaceholder}
          onChange={(e) => updateBrief({ rideIntentNotes: e.target.value })}
        />
      </label>
      <div className="threadline-step__actions">
        <button type="button" className="threadline-back" onClick={onBack} disabled>{siteContent.brief.backLabel}</button>
        <button type="button" className="action-link action-link--dark" onClick={onNext}>{siteContent.brief.nextLabel}</button>
      </div>
    </div>
  )
}

function GeometryStep({
  brief,
  updateBrief,
  onNext,
  onBack,
}: {
  brief: BriefState
  updateBrief: (p: Partial<BriefState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const { steps } = siteContent.brief
  return (
    <div className="threadline-step">
      <h3 className="threadline-step__question">{steps.geometry.question}</h3>
      <fieldset className="option-group">
        <legend className="sr-only">{steps.geometry.question}</legend>
        {GEOMETRY_PRIORITY_OPTIONS.map((opt) => (
          <label key={opt.id} className={`option-card${brief.geometryPriority === opt.id ? ' option-card--selected' : ''}`}>
            <input
              type="radio"
              name="geometry-priority"
              value={opt.id}
              checked={brief.geometryPriority === opt.id}
              onChange={() => updateBrief({ geometryPriority: opt.id })}
            />
            <span className="option-card__label">{opt.label}</span>
            <span className="option-card__desc">{opt.description}</span>
          </label>
        ))}
      </fieldset>
      <label className="threadline-step__notes">
        <span>{steps.geometry.notesLabel}</span>
        <textarea
          rows={2}
          value={brief.geometryNotes}
          placeholder={steps.geometry.notesPlaceholder}
          onChange={(e) => updateBrief({ geometryNotes: e.target.value })}
        />
      </label>
      <div className="threadline-step__actions">
        <button type="button" className="threadline-back" onClick={onBack}>{siteContent.brief.backLabel}</button>
        <button type="button" className="action-link action-link--dark" onClick={onNext}>{siteContent.brief.nextLabel}</button>
      </div>
    </div>
  )
}

function FinishStep({
  brief,
  updateBrief,
  onBack,
  briefText,
  onNewBrief,
}: {
  brief: BriefState
  updateBrief: (p: Partial<BriefState>) => void
  onBack: () => void
  briefText: string
  onNewBrief: () => void
}) {
  const { steps } = siteContent.brief
  const [generated, setGenerated] = useState(false)

  const toggleSwatch = useCallback((hex: string) => {
    updateBrief({
      selectedSwatches: brief.selectedSwatches.includes(hex)
        ? brief.selectedSwatches.filter((h) => h !== hex)
        : [...brief.selectedSwatches, hex],
    })
  }, [brief.selectedSwatches, updateBrief])

  const handleGenerate = useCallback((e: FormEvent) => {
    e.preventDefault()
    setGenerated(true)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(briefText)
    } catch { /* fallback — text is visible */ }
  }, [briefText])

  const handleDownload = useCallback(() => {
    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'syre-frame-brief.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [briefText])

  if (generated) {
    return (
      <div className="threadline-step">
        <h3 className="threadline-step__question">Your frame brief</h3>
        <div className="brief-output">
          <pre className="brief-output__text" tabIndex={0}>{briefText}</pre>
          <div className="brief-output__meta">
            <span aria-hidden="true">●</span> Local only — nothing was sent or stored
          </div>
          <div className="brief-output__actions">
            <button type="button" className="action-link action-link--dark" onClick={handleCopy}>{siteContent.brief.copyLabel}</button>
            <button type="button" className="action-link" onClick={handleDownload}>{siteContent.brief.downloadLabel}</button>
          </div>
        </div>
        <button type="button" className="threadline-back" onClick={onNewBrief}>Start a new brief</button>
      </div>
    )
  }

  return (
    <form className="threadline-step" onSubmit={handleGenerate}>
      <fieldset className="option-group">
        <legend className="threadline-step__question">{steps.finish.question}</legend>
        {FINISH_TYPE_OPTIONS.map((opt) => (
          <label key={opt.id} className={`option-card${brief.finishType === opt.id ? ' option-card--selected' : ''}`}>
            <input
              type="radio"
              name="finish-type"
              value={opt.id}
              checked={brief.finishType === opt.id}
              onChange={() => updateBrief({ finishType: opt.id })}
            />
            <span className="option-card__label">{opt.label}</span>
            <span className="option-card__desc">{opt.description}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="swatch-fieldset">
        <legend>{steps.finish.swatchLabel} <span className="swatch-fieldset__count">({brief.selectedSwatches.length} selected)</span></legend>
        <div className="swatch-grid">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              className={`swatch${brief.selectedSwatches.includes(swatch.hex) ? ' swatch--selected' : ''}`}
              style={{ backgroundColor: swatch.hex }}
              aria-pressed={brief.selectedSwatches.includes(swatch.hex)}
              aria-label={`${swatch.name} — ${swatch.hex}${brief.selectedSwatches.includes(swatch.hex) ? ', selected' : ''}`}
              onClick={() => toggleSwatch(swatch.hex)}
            />
          ))}
        </div>
      </fieldset>

      <label className="threadline-step__notes">
        <span>{steps.finish.notesLabel}</span>
        <textarea
          rows={2}
          value={brief.finishNotes}
          placeholder={steps.finish.notesPlaceholder}
          onChange={(e) => updateBrief({ finishNotes: e.target.value })}
        />
      </label>

      <div className="threadline-step__actions">
        <button type="button" className="threadline-back" onClick={onBack}>{siteContent.brief.backLabel}</button>
        <button type="submit" className="action-link action-link--dark">{siteContent.brief.generateLabel}</button>
      </div>
    </form>
  )
}

// ── Contextual engineering within Threadline ──

function ContextualEngineering({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <aside className="contextual-engineering" aria-label="Engineering context for ride intent">
        <h4>How layup changes with intent</h4>
        <p>An endurance frame uses more ±45° plies in the seat stays for vertical compliance. A climbing frame gets higher-modulus fibres in the down tube and BB shell for direct power transfer. A gravel frame adds reinforcement at the chain stay and tyre clearance. Tell us your intent and we tune the schedule.</p>
        <p><strong>Frame weight:</strong> Approximately 920 g for a size 54 before finish. Weight varies ±30 g with layup reinforcement.</p>
      </aside>
    )
  }
  if (step === 2) {
    return (
      <aside className="contextual-engineering" aria-label="Engineering context for geometry">
        <h4>How geometry shapes response</h4>
        <p>Trail, head angle, chain stay length, and bottom bracket drop are the primary levers. A sharper-handling frame uses shorter trail and steeper head angle. A planted frame uses longer chain stays and lower BB. Stack and reach define your position on the bike—include your fit numbers if you have them.</p>
        <p><strong>Hand layup note:</strong> Every frame is built to the geometry spec derived from your brief. No stock sizes. No compromise.</p>
      </aside>
    )
  }
  return (
    <aside className="contextual-engineering" aria-label="Finish context">
      <h4>Finish and weight</h4>
      <p>Raw carbon with a matte clear coat is the lightest option, saving approximately 20–40 g versus paint. Hydro dip adds negligible weight. Solid paint coverage adds an even, consistent layer. All finishes receive a UV-stable clear top coat.</p>
      <p><strong>Custom multi-colour:</strong> Describe your idea in the notes. Masked sections, gradients, and split finishes are all possible—the builder will talk through feasibility and cost.</p>
    </aside>
  )
}

// ── Contact CTA ──

function ContactCta() {
  if (!siteContent.contact.href) return null
  return (
    <div className="contact-cta">
      <a className="action-link action-link--dark" href={siteContent.contact.href}>{siteContent.contact.label}</a>
    </div>
  )
}

// ── Footer ──

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__main">
        <div>
          <Logo inverse />
          <p>{siteContent.tagline}</p>
        </div>
        <nav aria-label={siteContent.chrome.footerNavigationLabel}>
          {siteContent.footerLinks.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
      </div>
      <div className="container site-footer__legal">
        <span>{siteContent.chrome.copyright}</span>
        <a href="#top">{siteContent.chrome.backToTop}</a>
      </div>
    </footer>
  )
}

// ── Main Threadline (page section) ──

function ThreadlineSection() {
  const threadline = useThreadline()
  const { step, brief, updateBrief, goNext, goBack, resetBrief, generateBriefText } = threadline

  // Read nonce from URL if present
  const nonce = useMemo(() => {
    try { return new URL(window.location.href).searchParams.get('nonce') ?? undefined } catch { return undefined }
  }, [])

  const briefText = useMemo(() => generateBriefText(nonce), [generateBriefText, nonce])

  const handleNewBrief = useCallback(() => {
    resetBrief()
    document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth' })
  }, [resetBrief])

  return (
    <section className="threadline-section section" id="brief" aria-labelledby="brief-title">
      <div className="container">
        <div className="section-heading">
          <Eyebrow>{siteContent.brief.eyebrow}</Eyebrow>
          <h2 id="brief-title">{siteContent.brief.title}</h2>
          <p>{siteContent.brief.body}</p>
          <p className="brief-privacy"><span aria-hidden="true">●</span> {siteContent.brief.privacy}</p>
        </div>
        <ProgressIndicator step={step} total={3} />
        <div className="threadline-grid">
          <div className="threadline-main">
            {step === 1 && <RideIntentStep brief={brief} updateBrief={updateBrief} onNext={goNext} onBack={() => window.scrollTo(0, 0)} />}
            {step === 2 && <GeometryStep brief={brief} updateBrief={updateBrief} onNext={goNext} onBack={goBack} />}
            {step === 3 && <FinishStep brief={brief} updateBrief={updateBrief} onBack={goBack} briefText={briefText} onNewBrief={handleNewBrief} />}
          </div>
          <div className="threadline-context">
            <ContextualEngineering step={step} />
            <details className="contextual-faq" open={step === 1}>
              <summary><span>01</span><strong>About this brief</strong><i aria-hidden="true" /></summary>
              <p>This brief is a thinking tool—a concise summary of what you want from a frame. It captures your ride intent, geometry priorities, and finish preferences in one place. Nothing is sent or stored. Take it to your first conversation with the builder.</p>
            </details>
            {siteContent.faq.items.slice(0, 2).map((item, i) => (
              <details key={item.question} className="contextual-faq">
                <summary><span>{String(i + 2).padStart(2, '0')}</span><strong>{item.question}</strong><i aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
            <ContactCta />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── App ──

export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">{siteContent.chrome.skipLink}</a>
      <div id="top" />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <EngineeringSection />
        <LayupSection />
        <FinishOverviewSection />
        <ThreadlineSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
