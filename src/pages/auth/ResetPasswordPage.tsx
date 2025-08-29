import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useToast } from '../../store/toast';
import { useNavigate } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      push({ type: 'error', message: 'Erro ao redefinir senha.' });
    } else {
      push({ type: 'success', message: 'Senha redefinida com sucesso! Faça login.' });
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800 text-center">
      <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-neutral-800 text-white"
        required
        minLength={6}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
      >
        {loading ? 'Salvando...' : 'Salvar nova senha'}
      </button>
    </form>
  );
};
