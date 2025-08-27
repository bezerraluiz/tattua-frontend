import { useBilling } from '../../store/billing';
import { Link } from 'react-router-dom';

export const BillingPage = () => {
  const { plan, priceCents, renewingAt, status, cancel } = useBilling();
  const price = (priceCents / 100).toFixed(2);
  const next = renewingAt ? new Date(renewingAt).toLocaleDateString('pt-BR') : '-';
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie seu plano mensal Tattua.</p>
      </header>
      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-400">Plano</div>
              <div className="text-xl font-semibold">{plan ? 'Mensal' : 'Nenhum'}</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 uppercase tracking-wide">{status}</div>
          </div>
          <div className="text-sm text-neutral-400">Preço atual: <span className="text-neutral-200 font-medium">R$ {price}/mês</span></div>
          {plan && <p className="text-xs text-neutral-500">Próxima renovação: {next}</p>}
          {!plan && (
            <Link to="/app/pagamento" className="block text-center w-full py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium">Assinar agora</Link>
          )}
          {plan && status === 'active' && (
            <div className="flex gap-3">
              <Link to="/app/pagamento" className="flex-1 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium text-center">Gerenciar</Link>
              <button onClick={cancel} className="flex-1 py-2 rounded-md bg-neutral-800 ring-1 ring-neutral-700 hover:bg-neutral-700 text-sm font-medium">Cancelar</button>
            </div>
          )}
        </div>
        <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-3 text-sm leading-relaxed text-neutral-400">
          <h2 className="font-semibold text-neutral-200">Benefícios do Plano</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orçamentos ilimitados</li>
            <li>Campos personalizados</li>
            <li>Exportação PDF</li>
            <li>Atualizações e melhorias contínuas</li>
            <li>Suporte prioritário</li>
          </ul>
          <p className="text-xs text-neutral-500 pt-2">A cobrança é recorrente mensal. Você pode cancelar a qualquer momento e manterá o acesso até o final do ciclo atual.</p>
        </div>
      </section>
    </div>
  );
};
