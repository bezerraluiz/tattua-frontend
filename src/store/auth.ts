import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  login: (data: { name?: string; email: string }) => void;
  logout: () => void;
}

const loadUser = (): User | null => {
  try { return JSON.parse(localStorage.getItem('tattua:user') || 'null'); } catch { return null; }
};

export const useAuth = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? loadUser() : null,
  login: ({ name = 'Usuário', email }) => {
    const user: User = { id: crypto.randomUUID(), name, email };
    localStorage.setItem('tattua:user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('tattua:user');
    set({ user: null });
  }
}));
