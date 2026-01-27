import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

export default function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 w-[92vw] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="p-4 flex gap-3">
            <div className="mt-0.5">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Info className="w-5 h-5 text-[var(--primary)]" />
              )}
            </div>
            <div className="flex-1">
              {t.title && <div className="text-sm font-bold text-[var(--text-main)]">{t.title}</div>}
              <div className="text-sm text-[var(--text-muted)]">{t.message}</div>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold px-2"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
          <div
            className={`h-1 ${
              t.type === 'success' ? 'bg-green-500/70' : t.type === 'error' ? 'bg-red-500/70' : 'bg-[var(--primary)]/70'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

