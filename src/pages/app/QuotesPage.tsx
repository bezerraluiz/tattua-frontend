import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GetQuotesByUserUid } from '../../api/quote.services';
import { getCurrentUserId } from '../../supabase/api/user';
import { useToast } from '../../store/toast';

export const QuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      const user_uid = await getCurrentUserId();
      if (!user_uid) {
        push({ type: 'error', message: 'Usuário não autenticado.' });
        setLoading(false);
        return;
      }
      const result = await GetQuotesByUserUid(user_uid);
      if (result.error) {
        push({ type: 'error', message: 'Erro ao buscar orçamentos.' });
        setLoading(false);
        return;
      }
      setQuotes(result.data || []);
      setLoading(false);
    };
    fetchQuotes();
  }, [push]);

  const filtered = quotes.filter(q => q.client_name?.toLowerCase().includes(search.toLowerCase()));

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
        {loading ? (
          <div className="py-16 text-center text-neutral-400">Carregando orçamentos...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-800">
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Valor</th>
                <th className="py-2 pr-4 font-medium">Data</th>
                <th className="py-2 pr-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className="border-b border-neutral-900 hover:bg-neutral-900/60 transition-colors">
                  <td className="py-2 pr-4">{q.client_name}</td>
                  <td className="py-2 pr-4">R${(q.total/100).toFixed(2)}</td>
                  <td className="py-2 pr-4">{q.created_at ? new Date(q.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    {q.pdf_url && (
                      <a href={q.pdf_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-white">Baixar PDF</a>
                    )}
                    <Link to={`/app/orcamentos/${q.id}`} className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-xs text-white">Visualizar</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-neutral-500">Nenhum orçamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
