import { useCallback, useEffect, useRef, useState } from 'react'
import { brand, chrome } from './content/rideContent'
import { RideReplay } from './components/RideReplay'
import { BrandMark, FrameGraphic } from './components/Icons'

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`syre-logo${inverse ? ' syre-logo--inverse' : ''}`} href="#top" aria-label={chrome.homeLabel}>
      <BrandMark className="syre-logo__mark" />
      <span>{brand.name}</span>
    </a>
  )
}

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
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleResize = () => {
      if (window.innerWidth > 760) setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [closeMenu, menuOpen])

  return (
    <header className="syre-header">
      <div className="container syre-header__inner">
        <Logo />
        <nav className="syre-nav syre-nav--desktop" aria-label={chrome.primaryNavigationLabel}>
          <div className="syre-nav__links">
            <a href="#replay">The Journey</a>
            <a href="#facts">Facts</a>
          </div>
        </nav>
        <button
          ref={menuButtonRef}
          className="syre-menu-toggle"
          type="button"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span>{chrome.menuLabel}</span>
          <span className="syre-menu-toggle__icon" aria-hidden="true"><i /><i /></span>
        </button>
      </div>
      {menuOpen && (
        <div className="syre-mobile-menu" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMenu(true)
        }}>
          <div
            ref={menuPanelRef}
            className="syre-mobile-menu__panel"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="syre-mobile-menu__topline">
              <p id="mobile-menu-title">{chrome.menuTitle}</p>
              <button type="button" className="syre-menu-close" aria-label={chrome.menuCloseLabel} onClick={() => closeMenu(true)}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label={chrome.mobileNavigationLabel}>
              <a href="#replay" onClick={() => closeMenu(false)}>The Journey</a>
              <a href="#facts" onClick={() => closeMenu(false)}>Facts</a>
            </nav>
            <p className="syre-mobile-menu__note">{chrome.menuNote}</p>
          </div>
        </div>
      )}

    </header>
  )
}

function Footer() {
  return (
    <footer className="syre-footer">
      <div className="container syre-footer__main">
        <div>
          <Logo inverse />
          <p>{brand.tagline}</p>
        </div>
        <nav aria-label={chrome.footerNavigationLabel}>
          <a href="#replay">The Journey</a>
          <a href="#facts">Facts</a>
        </nav>
      </div>
      <div className="container syre-footer__legal">
        <span>{chrome.copyright}</span>
        <a href="#top">{chrome.backToTop}</a>
      </div>
    </footer>
  )
}

function Hero() {
  return (
    <section className="c3-hero" aria-labelledby="c3-hero-title">
      <div className="container c3-hero__grid">
        <div className="c3-hero__content">
          <h1 id="c3-hero-title">
            <span className="c3-hero__overline">SYRE concept 03</span>
            RIDE REPLAY
            <span className="c3-hero__subtitle">A temporal design journey</span>
          </h1>
          <p className="c3-hero__lede">
            Hand-laid carbon bicycle frames, configured step by step. Each choice reveals the reasoning,
            the materials, and the craft — an illustrative journey, not a performance claim.
          </p>
          <div className="c3-hero__facts">
            <span><strong>{brand.weightApprox}</strong> unpainted frame</span>
            <span aria-hidden="true">·</span>
            <span>{brand.construction}</span>
            <span aria-hidden="true">·</span>
            <span>{brand.finish}</span>
          </div>
          <a className="c3-hero__cta" href="#replay">
            Start the journey
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="c3-hero__visual" aria-hidden="true">
          <FrameGraphic />
        </div>
      </div>
      <div className="c3-hero__glow" aria-hidden="true" />
    </section>
  )
}

function FactsSection() {
  return (
    <section className="c3-facts" id="facts" aria-labelledby="facts-title">
      <div className="container c3-facts__grid">
        <div className="c3-facts__heading">
          <h2 id="facts-title">What we can say.</h2>
          <p>Ground truth about the boutique brand behind this concept. No invented metrics, no borrowed credibility.</p>
        </div>
        <dl className="c3-facts__list">
          <div className="c3-facts__item">
            <dt>Frame weight</dt>
            <dd>Approximately 920 g — size-medium road disc frame in raw carbon before paint.</dd>
          </div>
          <div className="c3-facts__item">
            <dt>Construction method</dt>
            <dd>Hand layup of unidirectional and 3K twill carbon plies. Every frame is built by a single craftsperson from cut to cure.</dd>
          </div>
          <div className="c3-facts__item">
            <dt>Finish process</dt>
            <dd>Hydro-dip with masked paint application. Raw carbon is revealed in controlled panels — the layup is part of the aesthetic.</dd>
          </div>
          <div className="c3-facts__item">
            <dt>Colour palette</dt>
            <dd>A 39-colour CMYK-derived palette spanning vivid neons, deep aquas, warm corals, and violet. Each colour is a considered state in the configurator.</dd>
          </div>
          <div className="c3-facts__item">
            <dt>Customisation depth</dt>
            <dd>Geometry profile, layup schedule, and finish treatment are each selected as distinct stages. No two frames follow the same path.</dd>
          </div>
          <div className="c3-facts__item">
            <dt>What this concept does not claim</dt>
            <dd>No stiffness data, aerodynamic figures, customer testimonials, awards, pricing, lead times, or availability. This is an illustrative design journey.</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export function App() {
  return (
    <>
      <a className="c3-skip-link" href="#main-content">{chrome.skipLink}</a>
      <div id="top" />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <div id="replay">
          <RideReplay />
        </div>
        <FactsSection />
      </main>
      <Footer />
    </>
  )
}
