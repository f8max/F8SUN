import { Component, type ErrorInfo, type ReactNode } from 'react'
import { SITE_CONTENT } from '../content/atelierContent'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { failed: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ATELIER render failure', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="error-fallback">
          <div>
            <p>{SITE_CONTENT.error.eyebrow}</p>
            <h1>{SITE_CONTENT.error.title}</h1>
            <p>{SITE_CONTENT.error.body}</p>
            <button type="button" onClick={() => window.location.reload()}>{SITE_CONTENT.error.action}</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
