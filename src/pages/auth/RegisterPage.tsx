import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../store/auth';
import { useState, useEffect } from 'react';
import { useProfile } from '../../store/profile';
import { useToast } from '../../store/toast';

import { RegisterUser, RegisterPayload, LoginResponse, type ErrorResponse, type RegisterResponse } from '../api/user.services';
import { maskCEP, maskCPF, maskCNPJ, maskTaxId, isValidCPF, isValidCNPJ, validTax } from '../../utils/validation';

export const RegisterPage = () => {
  const { login } = useAuth();
  const { push } = useToast();
  const { updateUser, updateAddress } = useProfile();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [cep, setCep] = useState('');
  const [taxId, setTaxId] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto buscar endereço quando CEP completo (8 dígitos)
  useEffect(() => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      (async () => {
        try {
          setCepLoading(true);
          const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setStreet(data.logradouro || '');
            setCity(data.localidade || '');
            setUf(data.uf || '');
            push({ type: 'success', message: 'Endereço encontrado pelo CEP.' });
          }
        } catch (e) {
          push({ type: 'error', message: 'Falha ao buscar CEP.' });
        } finally {
          setCepLoading(false);
        }
      })();
    }
  }, [cep]);

  const passwordsMatch = password && password === password2;
  const canSubmit = email && passwordsMatch && password.length >= 4 && cep.replace(/\D/g,'').length === 8 && street && number && city && uf && validTax(taxId);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setFormError('Preencha os campos obrigatórios corretamente.');
      return;
    }
    setFormError(null);
    setLoading(true);
    const payload: RegisterPayload = {
      studio_name: name,
      email,
      tax_id: taxId,
      password,
      country: 'Brasil',
      street,
      number,
      complement,
      city,
      state: uf,
      zip_code: cep.replace(/\D/g, '')
    };
    try {
      const response: RegisterResponse | ErrorResponse = await RegisterUser(payload);
      if (response.error) {
        push({ type: 'error', message: 'Erro ao criar conta. Verifique os dados.' });
      } else {
        updateUser({ studio_name: name, email, tax_id: taxId });
        updateAddress({
          country: 'Brasil',
          street,
          number,
          complement,
          city,
          state: uf,
          zip_code: cep.replace(/\D/g,'')
        });
  push({ type: 'success', message: 'Conta criada! Verifique seu e-mail para ativar.' });
  nav('/aguarde-verificacao', { state: { email } });
      }
    } catch (err) {
      push({ type: 'error', message: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Criar Conta</h1>
      <form className="space-y-5" onSubmit={submit}>
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">CPF/CNPJ</label>
          <input value={taxId} onChange={e => setTaxId(maskTaxId(e.target.value))} placeholder="CPF ou CNPJ" required className={`w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${taxId && !validTax(taxId) ? 'focus:ring-red-600 ring-1 ring-red-600' : 'focus:ring-brand-600'}`} />
          {taxId && !validTax(taxId) && <p className="text-xs text-red-500 mt-1">Documento inválido.</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmar Senha</label>
          <input value={password2} onChange={e => setPassword2(e.target.value)} type="password" required className={`w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${password2 && !passwordsMatch ? 'focus:ring-red-600 ring-1 ring-red-600' : 'focus:ring-brand-600'}`} />
          {password2 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">As senhas não conferem.</p>
          )}
        </div>
        <div className="pt-2 border-t border-neutral-800" />
        <div>
          <h2 className="text-sm font-semibold mb-3 text-neutral-300">Endereço</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">CEP</label>
              <div className="relative">
                <input value={cep} onChange={e => setCep(maskCEP(e.target.value))} placeholder="#####-###" maxLength={9} type="text" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-brand-600" />
                {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 animate-pulse">Buscando...</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Rua</label>
              <input value={street} onChange={e => setStreet(e.target.value)} type="text" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Número</label>
                <input value={number} onChange={e => setNumber(e.target.value)} type="text" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Complemento</label>
                <input value={complement} onChange={e => setComplement(e.target.value)} type="text" className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Cidade</label>
                <input value={city} onChange={e => setCity(e.target.value)} type="text" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div className="w-28">
                <label className="block text-sm mb-1">UF</label>
                <input value={uf} onChange={e => setUf(e.target.value.toUpperCase().slice(0,2))} type="text" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
            </div>
          </div>
        </div>
        {formError && <p className="text-xs text-red-500">{formError}</p>}
        <button type="submit" disabled={!canSubmit || loading} className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center">
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </button>
      </form>
      <p className="text-xs text-neutral-500 mt-6">Já tem conta? <Link to="/login" className="text-brand-400 hover:text-brand-300">Entrar</Link></p>
    </div>
  );
};
