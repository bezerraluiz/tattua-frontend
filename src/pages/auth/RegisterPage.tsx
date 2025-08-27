import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../store/auth';
import { useState, useEffect } from 'react';
import { useProfile } from '../../store/profile';
import { useToast } from '../../store/toast';
import { RegisterUser, RegisterPayload, LoginResponse, type ErrorResponse, type RegisterResponse } from '../api/user.services';

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

  // Máscaras
  const maskCEP = (v: string) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
  const maskCPF = (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  const maskCNPJ = (v: string) => v.replace(/\D/g,'').slice(0,14).replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2');
  const maskTaxId = (v: string) => v.replace(/\D/g,'').length <= 11 ? maskCPF(v) : maskCNPJ(v);

  const isValidCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g,'');
    if (cpf.length !== 11 || /(\d)\1{10}/.test(cpf)) return false;
    let soma = 0; for (let i=0;i<9;i++) soma += parseInt(cpf[i])*(10-i); let d1 = (soma*10)%11; if(d1===10) d1=0; if(d1!==parseInt(cpf[9])) return false;
    soma = 0; for (let i=0;i<10;i++) soma += parseInt(cpf[i])*(11-i); let d2 = (soma*10)%11; if(d2===10) d2=0; return d2===parseInt(cpf[10]);
  };
  const isValidCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/\D/g,'');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    const calc = (len: number) => {
      let nums = cnpj.substring(0,len);
      let sum = 0; let pos = len - 7;
      for (let i=len; i>=1; i--) { sum += parseInt(nums[len - i]) * pos--; if (pos < 2) pos = 9; }
      let res = sum % 11; return res < 2 ? 0 : 11 - res;
    };
    const d1 = calc(12); const d2 = calc(13); return d1 === parseInt(cnpj[12]) && d2 === parseInt(cnpj[13]);
  };
  const validTax = () => { const digits = taxId.replace(/\D/g,''); return digits.length<=11 ? isValidCPF(taxId) : isValidCNPJ(taxId); };

  const passwordsMatch = password && password === password2;
  const canSubmit = email && passwordsMatch && password.length >= 4 && cep.replace(/\D/g,'').length === 8 && street && number && city && uf && validTax();
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
        push({ type: 'success', message: 'Conta criada com sucesso! Faça login para continuar.' });
        nav('/login');
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
          <input value={taxId} onChange={e => setTaxId(maskTaxId(e.target.value))} placeholder="CPF ou CNPJ" required className={`w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${taxId && !validTax() ? 'focus:ring-red-600 ring-1 ring-red-600' : 'focus:ring-brand-600'}`} />
          {taxId && !validTax() && <p className="text-xs text-red-500 mt-1">Documento inválido.</p>}
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
