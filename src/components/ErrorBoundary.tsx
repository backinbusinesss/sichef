import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="grid min-h-[60svh] place-items-center bg-cream px-6">
          <div className="max-w-md text-center text-ink">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ember/10">
              <svg className="size-8 text-ember" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="font-display text-2xl">Qualcosa è andato storto</h2>
            <p className="mt-3 text-[0.9rem] text-ink/60">
              Si è verificato un errore imprevisto. Il nostro team è stato avvisato.
            </p>
            <div className="mt-5 flex gap-3 justify-center">
              <button
                onClick={this.reset}
                className="btn btn-clay"
              >
                Riprova
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-ghost"
              >
                Ricarica pagina
              </button>
            </div>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <details className="mt-6 text-left text-[0.65rem] text-ink/40">
                <summary>Dettagli tecnici</summary>
                <pre className="mt-2 p-3 overflow-auto rounded bg-ink/5 text-cream">{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}