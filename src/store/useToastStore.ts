import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'createdAt'> & { id?: string }) => void;
  remove: (id: string) => void;
  clear: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? makeId();
    const next: Toast = {
      id,
      type: toast.type,
      title: toast.title,
      message: toast.message,
      createdAt: Date.now(),
      action: toast.action,
    };

    set({ toasts: [next, ...get().toasts].slice(0, 4) });

    // Auto-dismiss
    window.setTimeout(() => {
      get().remove(id);
    }, 3500);
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));

export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().push({ type: 'success', message, title }),
  error: (message: string, title?: string) => useToastStore.getState().push({ type: 'error', message, title }),
  info: (message: string, title?: string) => useToastStore.getState().push({ type: 'info', message, title }),
};
