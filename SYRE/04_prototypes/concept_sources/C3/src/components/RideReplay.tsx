import { useCallback, useEffect, useReducer, useRef, useState, type KeyboardEvent } from 'react'
import { rideContent, chrome, type RideState } from '../content/rideContent'
import { rideReducer, createInitialState, verifyMachineState, type RideMachineState } from '../reducer/rideReducer'

function stateLabel(s: RideState): string {
  const c = rideContent[s]
  return `Stage ${c.number}: ${c.title}`
}

function sliderPercent(s: RideState): number {
  const order: RideState[] = ['define', 'shape', 'layup', 'finish', 'ready']
  return order.indexOf(s) / (order.length - 1)
}

function StateIndicator({ current }: { current: RideState }) {
  const order: RideState[] = ['define', 'shape', 'layup', 'finish', 'ready']
  return (
    <nav className="rr-track" aria-label="Configuration stages">
      <ol className="rr-track__list">
        {order.map((st) => {
          const c = rideContent[st]
          const isCurrent = st === current
          const isPast = order.indexOf(st) < order.indexOf(current)
          return (
            <li key={st} className={`rr-track__item${isCurrent ? ' rr-track__item--active' : ''}${isPast ? ' rr-track__item--past' : ''}`}>
              <span className="rr-track__dot" style={isCurrent || isPast ? { background: c.accent } : undefined} aria-hidden="true" />
              <span className="rr-track__num">{c.number}</span>
              <span className="rr-track__name">{c.title}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Annotations({ state }: { state: RideState }) {
  const content = rideContent[state]
  if (!content.annotations.length) return null

  return (
    <div className="rr-annotations">
      {content.annotations.map((ann, i) => (
        <details key={i} className="rr-annotation">
          <summary>
            <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <strong>{ann.summary}</strong>
            <i aria-hidden="true" />
          </summary>
          <p>{ann.detail}</p>
        </details>
      ))}
    </div>
  )
}

function ScenarioBadge({ scenario }: { scenario: string }) {
  if (!scenario) return null
  return (
    <div className="rr-scenario" aria-label={`Ride label: ${scenario}`}>
      <span aria-hidden="true">◆</span>
      {scenario}
    </div>
  )
}

function Receipt({ state }: { state: RideMachineState }) {
  if (!state.receipt) return null

  const verdict = verifyMachineState(state)
  const items = [
    { label: 'Session nonce', value: state.receipt.nonce },
    { label: 'State', value: state.receipt.state },
    { label: 'Ride label', value: state.receipt.choices.scenario },
    { label: 'Geometry', value: state.receipt.choices.geometry ?? '—' },
    { label: 'Layup schedule', value: state.receipt.choices.layupSchedule ?? '—' },
    { label: 'Finish treatment', value: state.receipt.choices.finishTreatment ?? '—' },
    { label: 'Visited states', value: state.receipt.visitedStates.join(' → ') },
    { label: 'Oracle check', value: verdict.pass ? 'PASS' : `BLOCKED: ${verdict.reasons.join('; ')}` },
  ]

  return (
    <div className="rr-receipt" role="region" aria-label="Configuration receipt">
      <div className="rr-receipt__header">
        <h2 className="rr-receipt__title">{rideContent.ready.heading}</h2>
        <p>{rideContent.ready.description}</p>
        <span className={`rr-receipt__badge${verdict.pass ? ' rr-receipt__badge--pass' : ' rr-receipt__badge--fail'}`}>
          {verdict.pass ? '✓ Verified' : '✗ Not verified'}
        </span>
      </div>
      <dl className="rr-receipt__grid">
        {items.map((item) => (
          <div key={item.label} className="rr-receipt__row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function RideReplay() {
  const [ms, dispatch] = useReducer(rideReducer, undefined, createInitialState)
  const [scrubValue, setScrubValue] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const scenarioRef = useRef<HTMLInputElement>(null)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const content = rideContent[ms.state]
  const isDefine = ms.state === 'define'
  const isReady = ms.state === 'ready'
  const canAdvance = !isReady && (!isDefine || ms.scenario.trim().length > 0)
  const canGoBack = ms.state !== 'define'

  const announce = useCallback((msg: string) => {
    setAnnouncement(msg)
    setTimeout(() => setAnnouncement(''), 3000)
  }, [])

  useEffect(() => {
    if (ms.playing && !isReady) {
      autoPlayRef.current = setInterval(() => {
        dispatch({ type: 'NEXT' })
      }, 4000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
    }
  }, [ms.playing, isReady])

  useEffect(() => {
    if (ms.state === 'ready' && ms.playing) {
      dispatch({ type: 'PAUSE' })
    }
  }, [ms.state, ms.playing])

  useEffect(() => {
    setScrubValue(sliderPercent(ms.state))
  }, [ms.state])

  const handleNext = useCallback(() => {
    if (!canAdvance) return
    dispatch({ type: 'NEXT' })
    const next = rideContent[ms.state]
    announce(`Advanced to ${next.title}`)
  }, [canAdvance, ms.state, announce])

  const handleBack = useCallback(() => {
    if (!canGoBack) return
    dispatch({ type: 'BACK' })
    announce('Returned to previous stage')
  }, [canGoBack, announce])

  const handleSubmitScenario = useCallback(() => {
    const value = scenarioRef.current?.value ?? ''
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch({ type: 'SET_SCENARIO', scenario: trimmed })
    dispatch({ type: 'NEXT' })
    announce(`Ride "${trimmed}" configured. Moving to Shape.`)
  }, [announce])

  const handleScrubberKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const order: RideState[] = ['define', 'shape', 'layup', 'finish', 'ready']
    const idx = order.indexOf(ms.state)
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx < order.length - 1) {
        if (ms.state === 'define' && !ms.scenario.trim()) return
        dispatch({ type: 'NEXT' })
        announce(`Advanced to ${rideContent[order[idx + 1]].title}`)
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (idx > 0) {
        dispatch({ type: 'BACK' })
        announce(`Returned to ${rideContent[order[idx - 1]].title}`)
      }
    }
  }, [ms.state, ms.scenario, announce])

  const handleChoice = useCallback((state: RideState, value: string, label: string) => {
    if (state === 'shape') dispatch({ type: 'SET_GEOMETRY', value })
    else if (state === 'layup') dispatch({ type: 'SET_LAYUP', value })
    else if (state === 'finish') dispatch({ type: 'SET_FINISH', value })

    announce(`${label} selected`)
    dispatch({ type: 'NEXT' })
  }, [announce])

  useEffect(() => {
    if (isDefine) {
      setTimeout(() => scenarioRef.current?.focus(), 100)
    }
  }, [isDefine])

  return (
    <div className="ride-replay" role="region" aria-label={chrome.replayLabel}>
      <StateIndicator current={ms.state} />

      <section className="rr-stage" aria-labelledby="rr-stage-heading" style={{ '--stage-accent': content.accent } as React.CSSProperties}>
        <div className="rr-stage__header">
          <div className="rr-stage__topline">
            <span className="rr-stage__stage">Stage {content.number}</span>
            <span className="rr-stage__title">{content.title}</span>
          </div>
          <h1 id="rr-stage-heading" className="rr-stage__heading">{content.heading}</h1>
          <p className="rr-stage__desc">{content.description}</p>
          <ScenarioBadge scenario={ms.scenario} />
        </div>

        {isDefine && (
          <div className="rr-define">
            <label htmlFor="scenario-input" className="rr-define__label">{content.prompt}</label>
            <div className="rr-define__row">
              <input
                ref={scenarioRef}
                id="scenario-input"
                className="rr-define__input"
                type="text"
                maxLength={120}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitScenario() }}
                placeholder="e.g. Sunday century, Alpine descent, dawn gravel loop"
              />
              <button
                className="rr-btn rr-btn--primary"
                type="button"
                disabled={false}
                onClick={handleSubmitScenario}
                style={{ '--btn-accent': content.accent } as React.CSSProperties}
              >
                Begin journey
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {content.choices && content.choices.length > 0 && (
          <fieldset className="rr-choices">
            <legend className="rr-choices__prompt">{content.prompt}</legend>
            <div className="rr-choices__grid">
              {content.choices.map((ch) => {
                const isSelected =
                  (ms.state === 'shape' && ms.choices.geometry === ch.value) ||
                  (ms.state === 'layup' && ms.choices.layupSchedule === ch.value) ||
                  (ms.state === 'finish' && ms.choices.finishTreatment === ch.value)
                return (
                  <button
                    key={ch.value}
                    type="button"
                    className={`rr-choice${isSelected ? ' rr-choice--selected' : ''}`}
                    onClick={() => handleChoice(ms.state, ch.value, ch.label)}
                    style={{ '--choice-accent': content.accent } as React.CSSProperties}
                  >
                    <span className="rr-choice__label">{ch.label}</span>
                    <span className="rr-choice__context">{ch.context}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}

        {isReady && <Receipt state={ms} />}

        <Annotations state={ms.state} />
      </section>

      <div className="rr-controls" role="toolbar" aria-label="Playback controls">
        <div className="rr-controls__scrubber">
          <button
            className="rr-btn rr-btn--icon"
            type="button"
            aria-label="Previous stage"
            disabled={!canGoBack}
            onClick={handleBack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="rr-scrubber">
            <div
              className="rr-scrubber__slider"
              role="slider"
              aria-label="Configuration stage"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={['define', 'shape', 'layup', 'finish', 'ready'].indexOf(ms.state)}
              aria-valuetext={stateLabel(ms.state)}
              tabIndex={0}
              onKeyDown={handleScrubberKeyDown}
            >
              <div className="rr-scrubber__track">
                <div
                  className="rr-scrubber__fill"
                  style={{ width: `${scrubValue * 100}%`, background: content.accent }}
                />
                <div
                  className="rr-scrubber__thumb"
                  style={{ left: `${scrubValue * 100}%` }}
                >
                  <span className="rr-scrubber__thumb-label">{content.number}</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              className="rr-scrubber__input"
              min={0}
              max={4}
              step={1}
              value={['define', 'shape', 'layup', 'finish', 'ready'].indexOf(ms.state)}
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const idx = Number(e.target.value)
                const order: RideState[] = ['define', 'shape', 'layup', 'finish', 'ready']
                const target = order[idx]
                if (target === ms.state) return
                if (idx > 0 && !ms.scenario.trim()) return
                dispatch({ type: 'GO_TO', state: target })
              }}
            />
          </div>

          <button
            className="rr-btn rr-btn--icon"
            type="button"
            aria-label="Next stage"
            disabled={!canAdvance}
            onClick={handleNext}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
              <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="rr-controls__actions">
          {ms.playing ? (
            <button
              className="rr-btn rr-btn--outline"
              type="button"
              onClick={() => dispatch({ type: 'PAUSE' })}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
              Pause
            </button>
          ) : (
            <button
              className="rr-btn rr-btn--outline"
              type="button"
              disabled={isReady}
              onClick={() => dispatch({ type: 'PLAY' })}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                <polygon points="5,3 19,12 5,21" fill="currentColor" />
              </svg>
              Play
            </button>
          )}

          <button
            className="rr-btn rr-btn--ghost"
            type="button"
            onClick={() => {
              dispatch({ type: 'RESET' })
              if (scenarioRef.current) scenarioRef.current.value = ''
              announce('Journey reset. Start a new configuration.')
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rr-announce" role="status" aria-live="polite" aria-atomic="true">
        {announcement ? <span>{announcement}</span> : null}
      </div>
    </div>
  )
}
