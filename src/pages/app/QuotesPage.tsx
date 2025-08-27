import { Link } from 'react-router-dom';
import { useQuoteStore } from '../../store/quotes';

export const QuotesPage = () => {
  const { quotes, search, setSearch } = useQuoteStore();
  const filtered = quotes.filter(q => q.client.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 md:w-64 bg-neutral-900 ring-1 ring-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          <Link to="/app/orcamentos/novo" className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium">Novo</Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-neutral-800">
              <th className="py-2 pr-4 font-medium">Cliente</th>
              <th className="py-2 pr-4 font-medium">Valor</th>
              <th className="py-2 pr-4 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id} className="border-b border-neutral-900 hover:bg-neutral-900/60 transition-colors">
                <td className="py-2 pr-4">{q.client}</td>
                <td className="py-2 pr-4">R${(q.total/100).toFixed(2)}</td>
                <td className="py-2 pr-4">{new Date(q.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-neutral-500">Nenhum orçamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
