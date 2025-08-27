import { create } from 'zustand';

interface BillingState {
  plan: 'mensal' | null;
  priceCents: number; // current plan price
  renewingAt?: string | null;
  status: 'inactive' | 'active' | 'canceled' | 'past_due';
  loading: boolean;
  startCheckout: () => Promise<string>; // returns sessionId
  activate: (sessionId: string) => void;
  cancel: () => void;
}

export const useBilling = create<BillingState>((set, get) => ({
  plan: null,
  priceCents: 8000,
  renewingAt: null,
  status: 'inactive',
  loading: false,
  startCheckout: async () => {
    set({ loading: true });
    // Simulate API call that would create Stripe Checkout Session
    await new Promise(r => setTimeout(r, 700));
    const sessionId = 'cs_test_' + Math.random().toString(36).slice(2);
    set({ loading: false });
    return sessionId;
  },
  activate: (sessionId: string) => {
    // Normally validate sessionId on backend then persist
    set({ plan: 'mensal', status: 'active', renewingAt: new Date(Date.now() + 30*24*60*60*1000).toISOString() });
  },
  cancel: () => set({ status: 'canceled' })
}));
