import { create } from 'zustand';

export interface UserData {
  user_id: number;
  studio_name: string;
  email: string;
  tax_id: string; // CPF/CNPJ
  telephone?: string; // Telefone
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
  clearProfile: () => void;
}

const defaultUser: UserData = {
  user_id: 0,
  studio_name: '',
  email: '',
  tax_id: '',
  telephone: ''
};

const defaultAddress: AddressData = {
  country: 'Brasil',
  street: '',
  number: '',
  complement: '',
  city: '',
  state: '',
  zip_code: ''
};

// Dados sensíveis não são salvos no localStorage por segurança
// Todos os dados são buscados da API sempre que necessário
export const useProfile = create<ProfileState>((set) => ({
  user: defaultUser,
  address: defaultAddress,
  updateUser: (patch) => set(state => ({
    user: { ...state.user, ...patch }
  })),
  updateAddress: (patch) => set(state => ({
    address: { ...state.address, ...patch }
  })),
  clearProfile: () => set({
    user: defaultUser,
    address: defaultAddress
  })
}));
