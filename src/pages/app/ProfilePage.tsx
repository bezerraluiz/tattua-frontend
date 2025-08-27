import { useState, useEffect } from 'react';
import { useProfile } from '../../store/profile';
import { useToast } from '../../store/toast';

export const ProfilePage = () => {
  const { user, address, updateUser, updateAddress } = useProfile();
  const { push } = useToast();
  const [userForm, setUserForm] = useState(user);
  const [addrForm, setAddrForm] = useState(address);
  const [savingUser, setSavingUser] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [userSavedAt, setUserSavedAt] = useState<Date | null>(null);
  const [addrSavedAt, setAddrSavedAt] = useState<Date | null>(null);

  const maskCEP = (v: string) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
  const maskCPF = (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  const maskCNPJ = (v: string) => v.replace(/\D/g,'').slice(0,14).replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2');
  const maskTaxId = (v: string) => v.replace(/\D/g,'').length <= 11 ? maskCPF(v) : maskCNPJ(v);
  const isValidCPF = (cpf: string) => { cpf=cpf.replace(/\D/g,''); if(cpf.length!==11||/(\d)\1{10}/.test(cpf)) return false; let s=0; for(let i=0;i<9;i++) s+=parseInt(cpf[i])*(10-i); let d=(s*10)%11; if(d===10) d=0; if(d!==parseInt(cpf[9])) return false; s=0; for(let i=0;i<10;i++) s+=parseInt(cpf[i])*(11-i); d=(s*10)%11; if(d===10) d=0; return d===parseInt(cpf[10]); };
  const isValidCNPJ = (cnpj: string) => { cnpj=cnpj.replace(/\D/g,''); if(cnpj.length!==14||/^(\d)\1+$/.test(cnpj)) return false; const calc=(l:number)=>{ let nums=cnpj.substring(0,l); let sum=0; let pos=l-7; for(let i=l;i>=1;i--){ sum+=parseInt(nums[l-i])*pos--; if(pos<2) pos=9;} let r=sum%11; return r<2?0:11-r; }; return calc(12)===parseInt(cnpj[12]) && calc(13)===parseInt(cnpj[13]); };
  const validTax = () => { const digits = userForm.tax_id.replace(/\D/g,''); return digits.length<=11 ? isValidCPF(userForm.tax_id) : isValidCNPJ(userForm.tax_id); };

  useEffect(()=>{
    // Auto buscar CEP
    const clean = addrForm.zip_code.replace(/\D/g,'');
    if (clean.length===8) {
      (async()=>{
        try {
          const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
          const data = await res.json();
            if(!data.erro) {
              setAddrForm(f=>({ ...f, street: data.logradouro || f.street, city: data.localidade || f.city, state: data.uf || f.state }));
              push({ type: 'success', message: 'Endereço atualizado pelo CEP.' });
            }
        } catch { push({ type: 'error', message: 'Erro ao buscar CEP.' }); }
      })();
    }
  },[addrForm.zip_code]);

  const saveUser = () => {
    setSavingUser(true);
    setTimeout(() => {
      if (!validTax()) { push({ type: 'error', message: 'Documento inválido.' }); setSavingUser(false); return; }
      updateUser({ ...userForm, tax_id: maskTaxId(userForm.tax_id) });
      setSavingUser(false);
      setUserSavedAt(new Date());
      push({ type: 'success', message: 'Dados do usuário salvos.' });
    }, 400);
  };
  const saveAddr = () => {
    setSavingAddr(true);
    setTimeout(() => {
      updateAddress(addrForm);
      setSavingAddr(false);
      setAddrSavedAt(new Date());
      push({ type: 'success', message: 'Endereço salvo.' });
    }, 400);
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie seus dados do estúdio e endereço.</p>
      </header>

      {/* Dados do Usuário */}
  <section className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">Dados do Usuário</h2>
          {userSavedAt && <span className="text-xs text-neutral-500">Salvo {userSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Field className="md:col-span-1" label="E-mail" value={userForm.email} onChange={v => setUserForm(f => ({ ...f, email: v }))} type="email" />
          <Field className="md:col-span-1" label="Nome do Estúdio" value={userForm.studio_name} onChange={v => setUserForm(f => ({ ...f, studio_name: v }))} />
          <Field className="md:col-span-1" label="CPF/CNPJ" value={userForm.tax_id} onChange={v => setUserForm(f => ({ ...f, tax_id: maskTaxId(v) }))} error={userForm.tax_id && !validTax() ? 'Inválido' : undefined} />
        </div>
        <div className="flex justify-end">
          <button onClick={saveUser} disabled={savingUser} className="px-5 py-2 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-sm font-medium text-white">{savingUser ? 'Salvando...' : 'Salvar Alterações'}</button>
        </div>
      </section>

      {/* Dados de Endereço */}
      <section className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">Dados de Endereço</h2>
          {addrSavedAt && <span className="text-xs text-neutral-500">Salvo {addrSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Field className="md:col-span-2" label="Rua" value={addrForm.street} onChange={v => setAddrForm(f => ({ ...f, street: v }))} />
          <Field label="Número" value={addrForm.number} onChange={v => setAddrForm(f => ({ ...f, number: v }))} />
          <Field label="Complemento" value={addrForm.complement || ''} onChange={v => setAddrForm(f => ({ ...f, complement: v }))} />
          <Field label="Cidade" value={addrForm.city} onChange={v => setAddrForm(f => ({ ...f, city: v }))} />
          <Field label="Estado" value={addrForm.state} onChange={v => setAddrForm(f => ({ ...f, state: v.toUpperCase().slice(0,2) }))} />
          <Field label="CEP" value={addrForm.zip_code ? maskCEP(addrForm.zip_code) : ''} onChange={v => setAddrForm(f => ({ ...f, zip_code: maskCEP(v) }))} />
          <Field label="País" value={addrForm.country} onChange={v => setAddrForm(f => ({ ...f, country: v }))} />
        </div>
        <div className="flex justify-end">
          <button onClick={saveAddr} disabled={savingAddr} className="px-5 py-2 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-sm font-medium text-white">{savingAddr ? 'Salvando...' : 'Salvar Endereço'}</button>
        </div>
      </section>
    </div>
  );
};

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange?: (value: string) => void;
  className?: string;
  error?: string;
}
const Field = ({ label, onChange, className = '', error, ...rest }: FieldProps) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-xs font-medium text-neutral-400">{label}</span>
    <input
      {...rest}
      onChange={e => onChange && onChange(e.target.value)}
      className={`w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-600 ring-1 ring-red-600' : 'focus:ring-brand-600'} disabled:opacity-60`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </label>
);
