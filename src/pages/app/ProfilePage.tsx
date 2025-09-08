import { useState, useEffect } from 'react';
import { useProfile } from '../../store/profile';
import { useToast } from '../../store/toast';
import { maskPhone, isValidPhone } from '../../utils/validation';
import { getCurrentUserId } from '../../supabase/api/user';
import { GetUser, GetUserAddress, UpdateUser, UpdateUserAddress } from '../../api/user.services';
import { handleAuthError } from '../../utils/handleAuthError';

export const ProfilePage = () => {
  const { user, address, updateUser, updateAddress } = useProfile();
  const { push } = useToast();
  const [userForm, setUserForm] = useState(user || {
    user_id: 0,
    studio_name: '',
    email: '',
    tax_id: '',
    telephone: ''
  });
  
  // Formatar telefone quando carregado do store
  useEffect(() => {
    if (user?.telephone && user.telephone !== userForm.telephone) {
      setUserForm(prev => ({
        ...prev,
        telephone: maskPhone(user.telephone || '')
      }));
    }
  }, [user?.telephone]);

  // Sincronizar userForm com o store do profile sempre que o usuário for atualizado
  useEffect(() => {
    if (user && user.user_id > 0) {
      console.log('Atualizando userForm com dados do store:', user);
      setUserForm(user);
    }
  }, [user]);
  const [addrForm, setAddrForm] = useState(address || {
    country: 'Brasil',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [savingUser, setSavingUser] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [lastCepUsed, setLastCepUsed] = useState<string>('');
  const [userSavedAt, setUserSavedAt] = useState<Date | null>(null);
  const [addrSavedAt, setAddrSavedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const maskCEP = (v: string) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
  const maskCPF = (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  const maskCNPJ = (v: string) => v.replace(/\D/g,'').slice(0,14).replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2');
  const maskTaxId = (v: string) => v.replace(/\D/g,'').length <= 11 ? maskCPF(v) : maskCNPJ(v);
  const isValidCPF = (cpf: string) => { cpf=cpf.replace(/\D/g,''); if(cpf.length!==11||/(\d)\1{10}/.test(cpf)) return false; let s=0; for(let i=0;i<9;i++) s+=parseInt(cpf[i])*(10-i); let d=(s*10)%11; if(d===10) d=0; if(d!==parseInt(cpf[9])) return false; s=0; for(let i=0;i<10;i++) s+=parseInt(cpf[i])*(11-i); d=(s*10)%11; if(d===10) d=0; return d===parseInt(cpf[10]); };
  const isValidCNPJ = (cnpj: string) => { cnpj=cnpj.replace(/\D/g,''); if(cnpj.length!==14||/^(\d)\1+$/.test(cnpj)) return false; const calc=(l:number)=>{ let nums=cnpj.substring(0,l); let sum=0; let pos=l-7; for(let i=l;i>=1;i--){ sum+=parseInt(nums[l-i])*pos--; if(pos<2) pos=9;} let r=sum%11; return r<2?0:11-r; }; return calc(12)===parseInt(cnpj[12]) && calc(13)===parseInt(cnpj[13]); };
  const validTax = () => { const digits = userForm.tax_id.replace(/\D/g,''); return digits.length<=11 ? isValidCPF(userForm.tax_id) : isValidCNPJ(userForm.tax_id); };
  const validPhone = () => !userForm.telephone || isValidPhone(userForm.telephone);

  // Buscar dados do usuário logado
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const user_uid = await getCurrentUserId();
        
        if (!user_uid) {
          push({ type: 'error', message: 'Usuário não autenticado.' });
          return;
        }

        // Usar a função GetUser que recebe user_uid (string)
        const result = await GetUser(user_uid);
        
        if (result.error) {
          const handledAuth = await handleAuthError(result, push);
          if (!handledAuth) {
            push({ type: 'error', message: result.message || 'Erro ao carregar dados do perfil.' });
          }
          return;
        }

        if (result.data) {
          // A API retorna os dados diretamente no objeto data, não em array
          const userData_api = Array.isArray(result.data) ? result.data[0] : result.data;
          
          console.log('Dados do usuário recebidos da API:', userData_api);
          
          // Atualizar os dados do usuário
          const userData = {
            user_id: userData_api.id,
            studio_name: userData_api.studio_name,
            email: userData_api.email,
            tax_id: userData_api.tax_id,
            telephone: userData_api.telephone ? maskPhone(userData_api.telephone) : undefined
          };

          console.log('Dados do usuário mapeados:', userData);

          // Atualizar formulário do usuário
          setUserForm(userData);
          updateUser(userData);

          // Buscar endereço separadamente usando o ID integer do usuário
          try {
            const addressResult = await GetUserAddress(userData_api.id);
            
            if (!addressResult.error && addressResult.data) {
              // Verificar se data é um array ou objeto, e se não está vazio
              const hasAddressData = Array.isArray(addressResult.data) 
                ? addressResult.data.length > 0 
                : Object.keys(addressResult.data).length > 0;
              
              if (hasAddressData) {
                const addressData_api = Array.isArray(addressResult.data) 
                  ? addressResult.data[0] 
                  : addressResult.data;
                
                const addressData = {
                  country: addressData_api.country || 'Brasil',
                  street: addressData_api.street || '',
                  number: addressData_api.number || '',
                  complement: addressData_api.complement || '',
                  city: addressData_api.city || '',
                  state: addressData_api.state || '',
                  zip_code: addressData_api.zip_code || ''
                };

                // Atualizar formulário e store do endereço
                setAddrForm(addressData);
                updateAddress(addressData);
                
                // Inicializar o CEP usado para evitar toast no primeiro carregamento
                if (addressData.zip_code) {
                  setLastCepUsed(addressData.zip_code.replace(/\D/g, ''));
                }
              } else {
                // Se não há endereço cadastrado, usar valores padrão
                const defaultAddress = {
                  country: 'Brasil',
                  street: '',
                  number: '',
                  complement: '',
                  city: '',
                  state: '',
                  zip_code: ''
                };
                setAddrForm(defaultAddress);
                updateAddress(defaultAddress);
              }
            } else {
              // Se não há endereço cadastrado, usar valores padrão
              const defaultAddress = {
                country: 'Brasil',
                street: '',
                number: '',
                complement: '',
                city: '',
                state: '',
                zip_code: ''
              };
              setAddrForm(defaultAddress);
              updateAddress(defaultAddress);
            }
          } catch (addressError) {
            console.error('Erro ao buscar endereço:', addressError);
            // Usar valores padrão em caso de erro
            const defaultAddress = {
              country: 'Brasil',
              street: '',
              number: '',
              complement: '',
              city: '',
              state: '',
              zip_code: ''
            };
            setAddrForm(defaultAddress);
            updateAddress(defaultAddress);
          }
        }
      } catch (error: any) {
        const handledAuth = await handleAuthError(error, push);
        if (!handledAuth) {
          push({ type: 'error', message: 'Erro ao carregar dados do perfil.' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [push, updateUser, updateAddress]);

  useEffect(() => {
    // Auto buscar CEP com debounce
    if (addrForm?.zip_code) {
      const clean = addrForm.zip_code.replace(/\D/g,'');
      if (clean.length === 8) {
        const timer = setTimeout(async () => {
          setLoadingCep(true);
          try {
            const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            const data = await res.json();
            if (!data.erro) {
              setAddrForm(f => ({ 
                ...f, 
                street: data.logradouro || f.street, 
                city: data.localidade || f.city, 
                state: data.uf || f.state 
              }));
              
              // Só mostra toast se o CEP for diferente do último usado
              if (lastCepUsed && lastCepUsed !== clean) {
                push({ type: 'success', message: 'Endereço atualizado pelo CEP.' });
              }
              
              setLastCepUsed(clean);
            } else {
              push({ type: 'error', message: 'CEP não encontrado.' });
            }
          } catch { 
            push({ type: 'error', message: 'Erro ao buscar CEP.' }); 
          } finally {
            setLoadingCep(false);
          }
        }, 500); // 500ms de debounce

        return () => {
          clearTimeout(timer);
          setLoadingCep(false);
        };
      }
    }
  }, [addrForm?.zip_code, push]);

  const saveUser = async () => {
    if (!validTax()) { 
      push({ type: 'error', message: 'Documento inválido.' }); 
      return; 
    }
    if (!validPhone()) { 
      push({ type: 'error', message: 'Telefone inválido.' }); 
      return; 
    }

    setSavingUser(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        push({ type: 'error', message: 'Usuário não autenticado.' });
        return;
      }

      const payload = {
        studio_name: userForm.studio_name,
        email: userForm.email,
        tax_id: maskTaxId(userForm.tax_id),
        telephone: userForm.telephone ? maskPhone(userForm.telephone) : undefined,
      };

      const result = await UpdateUser(userId, payload);
      if (result.error) {
        const handledAuth = await handleAuthError(result, push);
        if (!handledAuth) {
          push({ type: 'error', message: result.message || 'Erro ao salvar dados do usuário.' });
        }
        return;
      }

      // Atualizar o store com os novos dados
      updateUser({
        user_id: result.data!.id,
        studio_name: result.data!.studio_name,
        email: result.data!.email,
        tax_id: result.data!.tax_id,
        telephone: result.data!.telephone
      });
      setUserSavedAt(new Date());
      push({ type: 'success', message: 'Dados do usuário salvos com sucesso!' });
    } catch (error: any) {
      const handledAuth = await handleAuthError(error, push);
      if (!handledAuth) {
        push({ type: 'error', message: 'Erro ao salvar dados do usuário.' });
      }
    } finally {
      setSavingUser(false);
    }
  };
  const saveAddr = async () => {
    setSavingAddr(true);
    try {
      // Precisamos buscar o user_id do banco de dados, não o UID do Supabase
      if (!user?.user_id || user.user_id === 0) {
        push({ type: 'error', message: 'Dados do usuário não carregados. Tente recarregar a página.' });
        return;
      }

      console.log('Salvando endereço para user_id:', user.user_id, 'tipo:', typeof user.user_id);

      const payload = {
        user_id: user.user_id,
        country: addrForm.country,
        street: addrForm.street,
        number: addrForm.number,
        complement: addrForm.complement,
        city: addrForm.city,
        state: addrForm.state,
        zip_code: addrForm.zip_code
      };

      console.log('Payload do endereço:', payload, 'user_id tipo:', typeof payload.user_id);

      const result = await UpdateUserAddress(payload);
      if (result.error) {
        const handledAuth = await handleAuthError(result, push);
        if (!handledAuth) {
          push({ type: 'error', message: result.message || 'Erro ao salvar endereço.' });
        }
        return;
      }

      // Atualizar o store com os novos dados
      const addressData = Array.isArray(result.data) ? result.data[0] : result.data!;
      updateAddress({
        country: addressData.country,
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip_code
      });
      setAddrSavedAt(new Date());
      push({ type: 'success', message: 'Endereço salvo com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao salvar endereço:', error);
      const handledAuth = await handleAuthError(error, push);
      if (!handledAuth) {
        push({ type: 'error', message: 'Erro ao salvar endereço.' });
      }
    } finally {
      setSavingAddr(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie seus dados do estúdio e endereço.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="text-sm text-neutral-500">Carregando dados do perfil...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Dados do Usuário */}
          <section className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">Dados do Usuário</h2>
          {userSavedAt && <span className="text-xs text-neutral-500">Salvo {userSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Field className="md:col-span-1" label="E-mail" value={userForm.email || ''} onChange={v => setUserForm(f => ({ ...f, email: v }))} type="email" />
          <Field className="md:col-span-1" label="Nome do Estúdio" value={userForm.studio_name || ''} onChange={v => setUserForm(f => ({ ...f, studio_name: v }))} />
          <Field className="md:col-span-1" label="Telefone" value={userForm.telephone || ''} onChange={v => setUserForm(f => ({ ...f, telephone: maskPhone(v) }))} placeholder="(11) 91234-5678" error={userForm.telephone && !validPhone() ? 'Inválido' : undefined} />
          <Field className="md:col-span-3" label="CPF/CNPJ" value={userForm.tax_id || ''} onChange={v => setUserForm(f => ({ ...f, tax_id: maskTaxId(v) }))} error={userForm.tax_id && !validTax() ? 'Inválido' : undefined} disabled />
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
          <Field className="md:col-span-2" label="Rua" value={addrForm.street || ''} onChange={v => setAddrForm(f => ({ ...f, street: v }))} />
          <Field label="Número" value={addrForm.number || ''} onChange={v => setAddrForm(f => ({ ...f, number: v }))} />
          <Field label="Complemento" value={addrForm.complement || ''} onChange={v => setAddrForm(f => ({ ...f, complement: v }))} />
          <Field label="Cidade" value={addrForm.city || ''} onChange={v => setAddrForm(f => ({ ...f, city: v }))} />
          <Field label="Estado" value={addrForm.state || ''} onChange={v => setAddrForm(f => ({ ...f, state: v.toUpperCase().slice(0,2) }))} />
          <Field label={`CEP${loadingCep ? ' (buscando...)' : ''}`} value={addrForm.zip_code ? maskCEP(addrForm.zip_code) : ''} onChange={v => setAddrForm(f => ({ ...f, zip_code: maskCEP(v) }))} disabled={loadingCep} />
          <Field label="País" value={addrForm.country || ''} onChange={v => setAddrForm(f => ({ ...f, country: v }))} />
        </div>
        <div className="flex justify-end">
          <button onClick={saveAddr} disabled={savingAddr} className="px-5 py-2 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-sm font-medium text-white">{savingAddr ? 'Salvando...' : 'Salvar Endereço'}</button>
        </div>
      </section>
        </>
      )}
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
