import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    (this as unknown as { setState: (s: Partial<State>) => void }).setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.removeItem('interestly_audit_history');
      localStorage.removeItem('interestly_active_ledger');
      localStorage.removeItem('interestly_ledger_slots');
      localStorage.removeItem('interestly_monthly_books');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface p-4 text-on-surface">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-xl text-center flex flex-col items-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>

            <h1 className="font-display-xl font-bold text-xl sm:text-2xl text-on-surface tracking-tight mb-2">
              Application Recovery
            </h1>
            
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              A temporary display error occurred while rendering the page. You can reload the application or reset your local working cache to restore normal operation.
            </p>

            <div className="w-full flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all active:scale-[0.98] shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface text-sm font-semibold transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset Cache</span>
              </button>
            </div>

            {this.state.error && (
              <details className="w-full mt-6 text-left border-t border-outline-variant/20 pt-4">
                <summary className="text-xs font-mono text-secondary cursor-pointer hover:underline">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-surface-container-lowest text-[11px] font-mono text-error overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
