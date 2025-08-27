import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useBilling } from '../../store/billing';
import { useNavigate } from 'react-router-dom';

// Chave pública via .env (definir VITE_STRIPE_PK=...)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder');

export const PaymentPage = () => {
  const { startCheckout, activate, loading } = useBilling();
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const createCheckout = async () => {
    setError(null);
    try {
  const id = await startCheckout();
      setSessionId(id);
      // Em app real: redirecionar para Stripe Checkout via stripe.redirectToCheckout({ sessionId: id })
      // Aqui simulamos sucesso imediato
      setTimeout(() => {
        activate(id);
        navigate('/app/billing');
      }, 1000);
    } catch (e: any) {
      setError('Falha ao iniciar pagamento.');
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Pagamento</h1>
        <p className="text-sm text-neutral-500 mt-1">Finalize a assinatura mensal do Tattua.</p>
      </header>
      <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-5">
        <div className="space-y-2 text-sm text-neutral-400">
          <p>Você será redirecionado para o Stripe (simulação) para concluir o pagamento de <span className="text-neutral-200 font-medium">R$ 80,00 / mês</span>.</p>
          <p className="text-xs text-neutral-500">Use um cartão de teste Stripe (ex: 4242 4242 4242 4242, qualquer CVC, data futura).</p>
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button disabled={loading} onClick={createCheckout} className="w-full py-3 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-medium text-sm">
          {loading ? 'Processando...' : 'Pagar com Stripe'}
        </button>
        {sessionId && (
          <p className="text-[10px] text-neutral-600 break-all">Sessão: {sessionId}</p>
        )}
      </div>
      <div className="text-xs text-neutral-500">Após o sucesso do pagamento você será levado de volta para a página de plano.</div>
    </div>
  );
};
