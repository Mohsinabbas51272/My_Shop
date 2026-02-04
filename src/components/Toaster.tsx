import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

export default function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed top-20 right-1/2 translate-x-1/2 md:right-6 md:translate-x-0 z-[200] flex flex-col gap-3 w-auto max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-[#0F0A1F]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-hidden flex items-center min-w-[280px]"
          role="status"
          aria-live="polite"
        >
          <div className="py-2.5 pl-4 pr-1 flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 shrink-0">
              {t.type === 'success' ? (
                <Check className="w-4 h-4 text-white" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Info className="w-4 h-4 text-purple-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[13px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                {t.message}
              </p>
            </div>

            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  remove(t.id);
                }}
                className="text-[13px] font-black text-[#A855F7] hover:text-[#C084FC] transition-colors px-3 shrink-0"
              >
                {t.action.label}
              </button>
            )}

            <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

            <button
              onClick={() => remove(t.id)}
              className="p-2 hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-full mr-1 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

