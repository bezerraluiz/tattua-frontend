import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '../../store/toast';
import { supabase } from '../../utils/supabaseClient';

export const AwaitEmailVerification = () => {
  const location = useLocation();
  const email = location.state?.email;
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: {emailRedirectTo: 'http://localhost:5173/login'} });
    if (error) {
      push({ type: 'error', message: 'Erro ao reenviar e-mail.' });
    } else {
      push({ type: 'success', message: 'E-mail de verificação reenviado!' });
      setCountdown(10);
    }
    setLoading(false);
  };

  if (!email) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso inválido</h1>
        <p className="mb-6 text-neutral-400">Acesse esta página após criar sua conta.</p>
        <Link to="/register" className="inline-block px-6 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">Ir para cadastro</Link>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifique seu e-mail</h1>
      <p className="mb-4 text-neutral-300">
        Enviamos um link de confirmação para <span className="font-semibold text-brand-400">{email}</span>.<br/>
        Por favor, acesse seu e-mail e clique no link para ativar sua conta.
      </p>
      <p className="mb-6 text-neutral-400 text-sm">
        Após a verificação, você poderá fazer login normalmente.
      </p>
      {countdown > 0 ? (
        <div className="mb-4 text-sm text-neutral-400">{countdown} segundo{countdown > 1 ? 's' : ''} para poder reenviar</div>
      ) : (
        <button
          onClick={handleResend}
          disabled={loading}
          className="inline-block px-6 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors disabled:opacity-50 mr-3"
        >
          {loading ? 'Reenviando...' : 'Reenviar e-mail'}
        </button>
      )}
    </div>
  );
}
