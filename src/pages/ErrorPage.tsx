import { useLocation, Link } from 'react-router-dom';

export const ErrorPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error_description') || 'Ocorreu um erro desconhecido.';

  let message = error;
  if (
    error.toLowerCase().includes('expired') ||
    error.toLowerCase().includes('invalid')
  ) {
    message = 'O link de verificação expirou ou é inválido. Solicite um novo e-mail de verificação.';
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-400">Erro</h1>
      <p className="mb-6 text-neutral-300">{message}</p>
      <Link to="/" className="inline-block px-6 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">
        Voltar para a tela inicial
      </Link>
    </div>
  );
};
