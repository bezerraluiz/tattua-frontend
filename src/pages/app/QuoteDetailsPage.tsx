import { generateQuotePDF } from "../../utils/generateQuotePDF";
import { useQuoteStore } from "../../store/quotes";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuotesByUserUid } from "../../api/quote.services";
import { getCurrentUserId } from "../../supabase/api/user";


import { useToast } from "../../store/toast";


export default function QuoteDetailsPage() {
  // Função para gerar PDF
  const handleDownloadPDF = () => {
    if (!quote) return;
    generateQuotePDF(quote, fields);
  };
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
  // Função para buscar o valor numérico e label do campo select
  function getSelectValueAndLabel(fieldId: string, value: string) {
    const def = fieldDefs.find(f => f.id === fieldId && f.type === 'select');
    if (!def || !('options' in def)) return { value, label: value };
    const opt = def.options.find(o => o.id === value);
    if (!opt) return { value, label: value };
    // Exibe valor monetário se existir
    if (typeof opt.value === 'number' && !opt.percent) {
      return { value: `R$${(opt.value/100).toFixed(2)}`, label: opt.label };
    }
    // Exibe label se for percent
    return { value: opt.label, label: opt.label };
  }

  const fields: { label: string; value: any; rawValue?: string; fieldId?: string }[] = [
    { label: 'Profissional', value: quote.professional_name },
    { label: 'Cliente', value: quote.client_name },
    { label: 'Data da criação', value: quote.created_at ? new Date(quote.created_at).toLocaleDateString('pt-BR') : '-' },
    { label: 'Valor', value: `R$${(quote.total/100).toFixed(2)}` },
    (() => { const r = getSelectValueAndLabel('size', quote.tattoo_size); return { label: 'Tamanho', value: r.value, rawValue: r.label, fieldId: 'size' }; })(),
    (() => { const r = getSelectValueAndLabel('difficulty', quote.difficulty); return { label: 'Dificuldade', value: r.value, rawValue: r.label, fieldId: 'difficulty' }; })(),
    (() => { const r = getSelectValueAndLabel('body_region', quote.body_region); return { label: 'Região do corpo', value: r.value, rawValue: r.label, fieldId: 'body_region' }; })(),
    (() => { const r = getSelectValueAndLabel('colors', quote.colors_quantity); return { label: 'Quantidade de cores', value: r.value, rawValue: r.label, fieldId: 'colors' }; })(),
    (() => { const r = getSelectValueAndLabel('needle_fill', quote.needle_fill); return { label: 'Agulha/preenchimento', value: r.value, rawValue: r.label, fieldId: 'needle_fill' }; })(),
    { label: 'Horas estimadas', value: quote.estimated_hours},
    { label: 'Descrição', value: quote.description },
  ];
  if (quote.custom_fields && typeof quote.custom_fields === 'object') {
    Object.entries(quote.custom_fields).forEach(([key, value]) => {
      fields.push({ label: key, value: String(value) });
    });
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-neutral-950 rounded-xl shadow-lg p-6 text-white border border-neutral-800">
      <h1 className="text-3xl font-bold mb-2 text-brand-500 text-center">Detalhes do Orçamento</h1>
      <div className="flex flex-col gap-2 mt-6 mb-4">
        {fields.filter(f => f.value && f.value !== 'undefined' && f.value !== '').map((f, i) => (
          <div key={f.label} className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-900 transition">
            <span className={
              `font-semibold ${i < 2 ? 'text-brand-400' : 'text-neutral-300'} ${f.label === 'Valor' ? 'text-lg text-green-400' : ''}`
            }>{f.label}:</span>
            <span className={f.label === 'Valor' ? 'font-bold text-green-400 text-lg' : 'text-neutral-200'}>{f.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={handleDownloadPDF}
          className="px-5 py-2 rounded bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow"
        >
          Baixar PDF
        </button>
        {quote.pdf_url && (
          <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-white font-semibold shadow">PDF Salvo</a>
        )}
      </div>
      <div className="flex justify-center">
        <button onClick={() => navigate(-1)} className="px-5 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold">Voltar</button>
      </div>
    </div>
  );
}
