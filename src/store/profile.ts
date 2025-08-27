import { create } from 'zustand';

export interface UserData {
  user_id: number;
  studio_name: string;
  email: string;
  tax_id: string; // CPF/CNPJ
}

export interface AddressData {
  country: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zip_code: string;
}

interface ProfileState {
  user: UserData;
  address: AddressData;
  updateUser: (patch: Partial<UserData>) => void;
  updateAddress: (patch: Partial<AddressData>) => void;
}

const load = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? { ...fallback, ...JSON.parse(v) } : fallback; } catch { return fallback; }
};

export const useProfile = create<ProfileState>((set, get) => ({
  user: typeof window !== 'undefined' ? load<UserData>('tattua:profile:user', {
    user_id: 1,
    studio_name: 'Meu Estúdio',
    email: 'artista@studio.com',
    tax_id: ''
  }) : { user_id: 1, studio_name: '', email: '', tax_id: '' },
  address: typeof window !== 'undefined' ? load<AddressData>('tattua:profile:address', {
    country: 'Brasil',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zip_code: ''
  }) : { country: '', street: '', number: '', complement: '', city: '', state: '', zip_code: '' },
  updateUser: (patch) => set(state => {
    const user = { ...state.user, ...patch };
    localStorage.setItem('tattua:profile:user', JSON.stringify(user));
    return { user };
  }),
  updateAddress: (patch) => set(state => {
    const address = { ...state.address, ...patch };
    localStorage.setItem('tattua:profile:address', JSON.stringify(address));
    return { address };
  })
}));
