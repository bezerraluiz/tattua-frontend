import { Link, useLocation } from 'react-router-dom';

export const AwaitEmailVerification = () => {
  const location = useLocation();
  // Recebe o email via state para exibir na tela
  const email = location.state?.email || '';

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
      <Link to="/login" className="inline-block px-6 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">
        Já verifiquei, fazer login
      </Link>
    </div>
  );
}
