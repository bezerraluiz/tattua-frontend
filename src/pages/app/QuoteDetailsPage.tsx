import { useQuoteStore } from "../../store/quotes";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuotesByUserUid } from "../../api/quote.services";
import { getCurrentUserId } from "../../supabase/api/user";


import { useToast } from "../../store/toast";


export default function QuoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  const { fields: fieldDefs } = useQuoteStore();

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      try {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error("Usuário não autenticado");
        const result = await GetQuotesByUserUid(userId);
        if (result.error) {
          push({ type: 'error', message: result.message || 'Erro ao buscar orçamentos.' });
          navigate("/app/orcamentos");
          return;
        }
        const quotes = result.data || [];
        const found = quotes.find((q: any) => String(q.id) === String(id));
        if (!found) {
          push({ type: "error", message: "Orçamento não encontrado" });
          navigate("/app/orcamentos");
        } else {
          setQuote(found);
        }
      } catch (e: any) {
        push({ type: "error", message: e.message || "Erro ao buscar orçamento" });
        navigate("/app/orcamentos");
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-8 text-white">Carregando...</div>;
  if (!quote) return null;

  // Monta todos os campos preenchidos, incluindo padrão e personalizados
  // Função para buscar o label do campo select
  function getSelectLabel(fieldId: string, value: string) {
    const def = fieldDefs.find(f => f.id === fieldId && f.type === 'select');
    if (!def || !('options' in def)) return value;
    const opt = def.options.find(o => o.id === value);
    return opt ? opt.label : value;
  }

  const fields: { label: string; value: any }[] = [
    { label: 'Profissional', value: quote.professional_name },
    { label: 'Cliente', value: quote.client_name },
    { label: 'Data da criação', value: quote.created_at ? new Date(quote.created_at).toLocaleDateString('pt-BR') : '-' },
    { label: 'Valor', value: `R$${(quote.total/100).toFixed(2)}` },
    { label: 'Tamanho', value: getSelectLabel('tamanho', quote.tattoo_size) },
    { label: 'Dificuldade', value: getSelectLabel('dificuldade', quote.difficulty) },
    { label: 'Região do corpo', value: getSelectLabel('regiao', quote.body_region) },
    { label: 'Quantidade de cores', value: getSelectLabel('cores', quote.colors_quantity) },
    { label: 'Agulha/preenchimento', value: getSelectLabel('agulhas', quote.needle_fill) },
    { label: 'Horas estimadas', value: quote.estimated_hours},
    { label: 'Descrição', value: quote.description },
  ];
  if (quote.custom_fields && typeof quote.custom_fields === 'object') {
    Object.entries(quote.custom_fields).forEach(([key, value]) => {
      fields.push({ label: key, value: String(value) });
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Detalhes do Orçamento</h1>
      <div className="space-y-3 mb-6">
        {fields.filter(f => f.value && f.value !== 'undefined' && f.value !== '').map(f => (
          <div className="mb-1" key={f.label}>
            <span className="font-semibold">{f.label}:</span> {f.value}
          </div>
        ))}
      </div>
      {quote.pdf_url && (
        <div className="mb-4">
          <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-500 text-white">Baixar PDF</a>
        </div>
      )}
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Voltar</button>
    </div>
  );
}
