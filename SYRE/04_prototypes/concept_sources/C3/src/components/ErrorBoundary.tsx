import { Component, type ErrorInfo, type ReactNode } from 'react'

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
            <p>SYRE</p>
            <h1>The page lost its thread.</h1>
            <p>Reload to start again. No information was sent or stored.</p>
            <button type="button" onClick={() => window.location.reload()}>Reload the page</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
