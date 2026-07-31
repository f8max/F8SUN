import { Component, type ErrorInfo, type ReactNode } from 'react'
import { siteContent } from '../content/siteContent'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { failed: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SYRE render failure', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="error-fallback">
          <div>
            <p>{siteContent.error.eyebrow}</p>
            <h1>{siteContent.error.title}</h1>
            <p>{siteContent.error.body}</p>
            <button type="button" onClick={() => window.location.reload()}>{siteContent.error.action}</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
