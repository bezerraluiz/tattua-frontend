import { useState } from 'react';
import { useQuoteStore } from '../../store/quotes';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../supabase/api/user';
import { CreateQuote } from '../../api/quote.services';
import { handleAuthError } from '../../utils/handleAuthError';
import { useToast } from '../../store/toast';

export const QuoteBuilderPage = () => {
  const { fields } = useQuoteStore();
  const [client, setClient] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [selections, setSelections] = useState<Record<string, string | undefined>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [numbers, setNumbers] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { push } = useToast();

  const calculateTotal = () => {
    let total = 0;
    let base = 0;
    let additions = 0;
    let percent = 0; // soma de percentuais
    for (const f of fields) {
      if (f.type === 'select') {
        const sel = selections[f.id];
        if (!sel) continue;
        const opt = f.options?.find(o => o.id === sel);
        if (!opt) continue;
        if ((opt as any).percent) {
          percent += opt.value; // valor em %
        } else {
          additions += opt.value;
        }
      } else if (f.type === 'text') {
        if (texts[f.id] && f.basePrice) additions += f.basePrice;
      } else if (f.type === 'number') {
        const val = numbers[f.id] || 0;
        base += val * f.multiplier; // horas * 10000 = R$100/h etc
      }
    }
    total = base + additions;
    if (percent > 0) total += Math.round(total * (percent / 100));
    return total;
  };
  const total = calculateTotal();

  const save = async (download?: boolean) => {
    try {
      const user_uid = await getCurrentUserId();
      if (!user_uid) {
        push({ type: 'error', message: 'Usuário não autenticado.' });
        return;
      }

      // Monta o payload para o backend
      const payload = {
        client_name: client,
        professional_name: professionalName,
        tattoo_size: selections['tamanho'] || '',
        difficulty: selections['dificuldade'] || '',
        body_region: selections['regiao'] || '',
        colors_quantity: selections['cores'] || '',
        needle_fill: selections['agulhas'] || '',
        estimated_hours: numbers['horas'] || 0,
        description: texts['descricao'] || '',
        total,
        custom_fields: {}, // Adapte se quiser salvar extras
        user_uid: user_uid,
      };

      const result = await CreateQuote(payload);
      if (result.error) {
        if (!handleAuthError(result.error, push)) {
          push({ type: 'error', message: 'Erro ao criar orçamento.' });
        }
        return;
      }

      if (download) {
        const doc = new jsPDF();
        const date = new Date();
        doc.setFontSize(16);
        doc.text('ORÇAMENTO', 105, 15, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`Cliente: ${client}`, 14, 30);
        doc.text(`Data: ${date.toLocaleDateString('pt-BR')}`, 14, 36);
        // Tabela
        let y = 50;
        doc.setFillColor(60,60,60);
        doc.setTextColor(255);
        doc.rect(14, y-6, 182, 8, 'F');
        doc.text('Item', 20, y-1);
        doc.text('Descrição', 80, y-1);
        doc.text('Valor (R$)', 170, y-1, { align: 'right' });
        doc.setTextColor(0);
        y += 4;
        doc.setFontSize(10);
        for (const f of fields) {
          let desc = '';
          let val = 0;
          if (f.type === 'select') {
            const opt = f.options?.find(o => o.id === selections[f.id]);
            if (!opt) continue;
            desc = opt.label; val = (opt as any).percent ? 0 : opt.value;
          } else if (f.type === 'text') {
            desc = texts[f.id] || '-'; val = f.basePrice || 0;
          } else if (f.type === 'number') {
            const num = numbers[f.id] || 0;
            desc = `${num} ${f.unit}`; val = num * f.multiplier;
          }
          doc.text(f.label, 20, y);
          doc.text(desc, 80, y, { align: 'center' });
          doc.text((val/100).toFixed(2), 170, y, { align: 'right' });
          y += 7;
          if (y > 270) { doc.addPage(); y = 20; }
        }
        doc.setFontSize(12);
        doc.setDrawColor(60,60,60);
        doc.line(14, y+2, 196, y+2);
        doc.setFontSize(14);
        doc.text(`TOTAL: R$ ${(total/100).toFixed(2)}`, 196, y+12, { align: 'right' });
        doc.save(`orcamento-${client}.pdf`);
      }
      navigate('/app/orcamentos');
    } catch (e: any) {
      if (!handleAuthError(e, push)) {
        push({ type: 'error', message: 'Erro ao criar orçamento.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Novo Orçamento</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-4">
            <div>
              <label className="block text-sm mb-1">Cliente</label>
              <input value={client} onChange={e => setClient(e.target.value)} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            <div>
              <label className="block text-sm mb-1">Profissional responsável</label>
              <input value={professionalName} onChange={e => setProfessionalName(e.target.value)} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            {fields.map(f => (
              <div key={f.id} className="space-y-1">
                <label className="block text-sm font-medium">{f.label}</label>
                {f.type === 'select' && (
                  <select value={selections[f.id] || ''} onChange={e => setSelections(s => ({ ...s, [f.id]: e.target.value }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
                    <option value="">Selecionar...</option>
                    {f.options?.map(o => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                )}
                {f.type === 'text' && (
                  <input value={texts[f.id] || ''} onChange={e => setTexts(t => ({ ...t, [f.id]: e.target.value }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                )}
                {f.type === 'number' && (
                  <input type="number" min={f.min} step={f.step} value={numbers[f.id] ?? ''} onChange={e => setNumbers(n => ({ ...n, [f.id]: parseFloat(e.target.value) || 0 }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder={`0 ${f.unit}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-4">
            <div className="text-sm text-neutral-400">Resumo</div>
            <div className="text-3xl font-bold">R$ {(total/100).toFixed(2)}</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/app/orcamentos')} className="px-4 py-2 rounded-md bg-neutral-800 ring-1 ring-neutral-700 hover:bg-neutral-700 text-sm font-medium">Cancelar</button>
              <button disabled={!client} onClick={() => save()} className="flex-1 py-2 rounded-md bg-brand-600 disabled:opacity-40 hover:bg-brand-500 text-white text-sm font-medium">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
