import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GetQuotesByUserUid } from '../../api/quote.services';
import { getCurrentUserId } from '../../supabase/api/user';
import { handleAuthError } from '../../utils/handleAuthError';
import { useToast } from '../../store/toast';
import { generateQuotePDF } from '../../utils/generateQuotePDF';
import { useQuoteStore } from '../../store/quotes';

export const QuotesPage = () => {
  const { fields: fieldDefs } = useQuoteStore();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  // Adapter para garantir tipos corretos para handleAuthError
  const pushToast = (msg: { type: 'error' | 'success' | 'info'; message: string }) => push(msg);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const user_uid = await getCurrentUserId();
        if (!user_uid) {
          pushToast({ type: 'error', message: 'Usuário não autenticado.' });
          setLoading(false);
          return;
        }
        const result = await GetQuotesByUserUid(user_uid);
        if (result.error) {
          if (!handleAuthError(result.error, pushToast)) {
            pushToast({ type: 'error', message: 'Erro ao buscar orçamentos.' });
          }
          setLoading(false);
          return;
        }
        setQuotes(result.data || []);
      } catch (e: any) {
        if (!handleAuthError(e, pushToast)) {
          pushToast({ type: 'error', message: 'Erro ao buscar orçamentos.' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [push]);

  const filtered = quotes.filter(q => q.client_name?.toLowerCase().includes(search.toLowerCase()));

  // Monta campos para PDF (padrão + customizados)
  function buildFieldsForPDF(quote: any) {
    function getSelectValueAndLabel(fieldId: string, value: string) {
      const def = fieldDefs.find(f => f.id === fieldId && f.type === 'select');
      if (!def || !('options' in def)) return { value, label: value };
      const opt = def.options.find(o => o.id === value);
      if (!opt) return { value, label: value };
      if (typeof opt.value === 'number') {
        return { value: `R$${(opt.value/100).toFixed(2)}`, label: opt.label };
      }
      return { value: opt.label, label: opt.label };
    }
    const fields = [
      { label: 'Profissional', value: quote.professional_name },
      { label: 'Cliente', value: quote.client_name },
      { label: 'Data da criação', value: quote.created_at ? new Date(quote.created_at).toLocaleDateString('pt-BR') : '-' },
      { label: 'Valor', value: `R$${(quote.total/100).toFixed(2)}` },
      { ...getSelectValueAndLabel('size', quote.tattoo_size), label: 'Tamanho', fieldId: 'size' },
      { ...getSelectValueAndLabel('difficulty', quote.difficulty), label: 'Dificuldade', fieldId: 'difficulty' },
      { ...getSelectValueAndLabel('body_region', quote.body_region), label: 'Região do corpo', fieldId: 'body_region' },
      { ...getSelectValueAndLabel('colors', quote.colors_quantity), label: 'Quantidade de cores', fieldId: 'colors' },
      { ...getSelectValueAndLabel('needle_fill', quote.needle_fill), label: 'Agulha/preenchimento', fieldId: 'needle_fill' },
      { label: 'Horas estimadas', value: quote.estimated_hours },
      { label: 'Descrição', value: quote.description },
    ];
    if (quote.custom_fields && typeof quote.custom_fields === 'object') {
      Object.entries(quote.custom_fields).forEach(([key, value]) => {
        fields.push({ label: key, value: String(value) });
      });
    }
    return fields;
  }

  function handleDownloadPDF(quote: any) {
    const fields = buildFieldsForPDF(quote);
    generateQuotePDF(quote, fields);
  }

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
                    <Link to={`/app/orcamentos/${q.id}`} className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-xs text-white">Visualizar</Link>
                    <button
                      onClick={() => handleDownloadPDF(q)}
                      className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-white border border-brand-600 flex items-center gap-1"
                      title="Baixar PDF"
                    >
                      <span>PDF</span>
                    </button>
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
