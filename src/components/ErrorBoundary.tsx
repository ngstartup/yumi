import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/ds';
import { Fox } from '@/mascot';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/** Aucune stack trace ne doit jamais atteindre l'utilisateur. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[yumi] erreur non gérée', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-alt px-6 text-center">
        <Fox expression="sad" size={120} />
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Une erreur est survenue</h1>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Votre progression est conservée sur votre appareil. Rechargez la page pour reprendre.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Recharger</Button>
      </div>
    );
  }
}
