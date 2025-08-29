import { useState } from 'react';
import { forgotPassword } from '../../supabase/api/auth';
import { useToast } from '../../store/toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  const { error } = await forgotPassword(email);
    if (error) {
      push({ type: 'error', message: 'Erro ao enviar e-mail de recuperação.' });
    } else {
      push({ type: 'success', message: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800 text-center">
      <h1 className="text-2xl font-bold mb-4">Recuperar senha</h1>
      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-neutral-800 text-white"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
      >
        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
      </button>
    </form>
  );
};
