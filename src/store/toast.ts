import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  ttl?: number; // ms
}
interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

let idc = 0;
export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `t${++idc}`;
    const toast: Toast = { id, ttl: 4000, ...t };
    set(state => ({ toasts: [...state.toasts, toast] }));
    if (toast.ttl) setTimeout(() => get().dismiss(id), toast.ttl);
  },
  dismiss: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));
