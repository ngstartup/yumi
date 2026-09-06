import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { feedback, type FeedbackEvent } from '@/lib/feedback';

export interface Toast {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

interface ToastValue {
  toasts: Toast[];
  push: (message: string, tone?: Toast['tone'], icon?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: Toast['tone'] = 'info', icon?: string) => {
      const cue: Record<Toast['tone'], FeedbackEvent> = {
        info: 'open',
        success: 'success',
        warning: 'warning',
        error: 'error',
      };
      feedback(cue[tone]);
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-2), { id, message, tone, icon }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  const tones: Record<Toast['tone'], string> = {
    info: 'bg-ink text-white',
    success: 'bg-mint-600 text-white',
    warning: 'bg-sun-400 text-ink',
    error: 'bg-coral-500 text-white',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+var(--safe-bottom))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex max-w-sm animate-riseIn items-center gap-2 rounded-xl2 px-4 py-3 text-sm font-medium shadow-lift',
              tones[t.tone]
            )}
          >
            {t.icon && <span aria-hidden="true">{t.icon}</span>}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
