import { Link } from 'react-router-dom';
import { useQuoteStore } from '../../store/quotes';
import { FileText, Plus, Settings, TrendingUp, RefreshCw } from 'lucide-react';
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { handleAuthError } from '../../utils/handleAuthError';
import { getCurrentUserId } from '../../supabase/api/user';
import { GetQuotesByUserUid } from '../../api/quote.services';
import { useToast } from '../../store/toast';

interface UserQuote {
  id: string;
  client_name: string;
  professional_name: string;
  total: number;
  created_at: string;
  tattoo_size: string;
  difficulty: string;
  body_region: string;
  colors_quantity: string;
  needle_fill: string;
  estimated_hours: number;
  description?: string;
}

export const DashboardPage = () => {
  const { fields } = useQuoteStore();
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  // Function to fetch quotes (extracted for reuse)
  const fetchUserQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        push({ type: 'error', message: 'Usuário não autenticado.' });
        return;
      }

      const result = await GetQuotesByUserUid(userId);
      if (result.error) {
        if (!handleAuthError(result, push)) {
          push({ type: 'error', message: 'Erro ao carregar orçamentos.' });
        }
        return;
      }

      // Assuming the API returns quotes in result.data
      const quotes = result.data || [];
      // Sort quotes by creation date (newest first)
      const sortedQuotes = quotes.sort((a: UserQuote, b: UserQuote) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setUserQuotes(sortedQuotes);
    } catch (error: any) {
      if (!handleAuthError(error, push)) {
        push({ type: 'error', message: 'Erro ao carregar orçamentos.' });
      }
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Fetch user quotes on component mount
  useEffect(() => {
    fetchUserQuotes();
  }, [fetchUserQuotes]);

  // Mês atual
  const now = new Date();
  const monthKey = now.getFullYear() + '-' + (now.getMonth()+1);
  const stats = useMemo(() => {
    const inMonth = userQuotes.filter((q: UserQuote) => {
      const d = new Date(q.created_at);
      const isInMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return isInMonth;
    });
    
    const monthlyRevenue = inMonth.reduce((acc: number, q: UserQuote) => acc + q.total, 0);
    const totalRevenue = userQuotes.reduce((acc: number, q: UserQuote) => acc + q.total, 0);
    const avg = inMonth.length ? monthlyRevenue / inMonth.length : 0; // ticket médio do mês
    const avgTotal = userQuotes.length ? totalRevenue / userQuotes.length : 0; // ticket médio total
    const last5 = userQuotes.slice(0, 5);
    
    // Distribuição diária para gráfico do mês atual
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    const dailyCounts = Array.from({ length: daysInMonth }, (_, i) => ({ day: i+1, count: 0 }));
    inMonth.forEach((q: UserQuote) => { const d = new Date(q.created_at).getDate(); dailyCounts[d-1].count++; });
    
    // Se não há dados no mês atual, criar gráfico dos últimos 3 meses
    const last3MonthsCounts = [];
    if (inMonth.length === 0 && userQuotes.length > 0) {
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthQuotes = userQuotes.filter((q: UserQuote) => {
          const d = new Date(q.created_at);
          return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        });
        last3MonthsCounts.push({
          month: monthDate.getMonth() + 1,
          count: monthQuotes.length,
          label: monthDate.toLocaleDateString('pt-BR', { month: 'short' })
        });
      }
    }
    
    return { monthlyRevenue, totalRevenue, avg, avgTotal, last5, dailyCounts, inMonthCount: inMonth.length, last3MonthsCounts };
  }, [userQuotes, now]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (loading) return; // Don't render chart while loading
    
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0,0,w,h);
    
    // Use gráfico de 3 meses se não há dados no mês atual
    const useMonthlyData = stats.inMonthCount === 0 && stats.last3MonthsCounts.length > 0;
    const data = useMonthlyData ? stats.last3MonthsCounts : stats.dailyCounts;
    const max = Math.max(1, ...data.map(d => d.count));
    const pad = 24; const innerW = canvas.clientWidth - pad*2; const innerH = canvas.clientHeight - pad*2;
    
    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i=0;i<=max;i++) { const y = pad + innerH - (i/max)*innerH; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(pad+innerW,y); ctx.stroke(); }
    
    // line
    ctx.strokeStyle = '#9d4bff'; ctx.lineWidth = 2; ctx.beginPath();
    data.forEach((pt,i)=>{
      const x = pad + (i/(data.length-1))*innerW;
      const y = pad + innerH - (pt.count/max)*innerH;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    
    // area
    ctx.fillStyle = 'rgba(157,75,255,0.15)'; ctx.lineTo(pad+innerW,pad+innerH); ctx.lineTo(pad,pad+innerH); ctx.closePath(); ctx.fill();
    
    // axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px system-ui';
    if (useMonthlyData) {
      // Labels for months
      data.forEach((pt: any, i: number) => {
        const x = pad + (i/(data.length-1))*innerW;
        ctx.fillText(pt.label, x-10, h/window.devicePixelRatio - 4);
      });
    } else {
      // Labels for days (sparse)
      const step = Math.ceil(data.length / 6);
      for (let d=0; d<data.length; d+=step) { 
        const x = pad + (d/(data.length-1))*innerW; 
        ctx.fillText(String((data[d] as any).day), x-6, h/window.devicePixelRatio - 4); 
      }
    }
  }, [stats.dailyCounts, stats.last3MonthsCounts, stats.inMonthCount, loading]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-neutral-500 mt-1">Resumo rápido da sua atividade recente.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUserQuotes}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 ring-1 ring-neutral-700 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
            Atualizar
          </button>
          <Link to="/app/orcamentos/novo" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-sm font-medium text-white"><Plus className="w-4 h-4"/>Novo Orçamento</Link>
          <Link to="/app/configuracoes" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 ring-1 ring-neutral-700 text-sm font-medium"><Settings className="w-4 h-4"/>Campos</Link>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard 
          label="Orçamentos" 
          value={loading ? '...' : userQuotes.length} 
          sub={loading ? 'Carregando...' : userQuotes.length ? `Último: ${new Date(userQuotes[0].created_at).toLocaleDateString('pt-BR')}` : 'Nenhum ainda'} 
          icon={<FileText className="w-5 h-5"/>} 
        />
        <StatCard label="Campos" value={fields.length} sub="Campos configurados" />
        <StatCard 
          label="Receita (mês)" 
          value={loading ? '...' : stats.inMonthCount > 0 ? `R$ ${(stats.monthlyRevenue/100).toFixed(2)}` : `R$ ${(stats.totalRevenue/100).toFixed(2)}`} 
          sub={loading ? 'Carregando...' : stats.inMonthCount > 0 ? now.toLocaleDateString('pt-BR', { month: 'long' }) : 'Total geral'} 
          icon={<TrendingUp className="w-5 h-5"/>} 
        />
        <StatCard 
          label="Ticket Médio" 
          value={loading ? '...' : stats.avg > 0 ? `R$ ${(stats.avg/100).toFixed(2)}` : stats.avgTotal > 0 ? `R$ ${(stats.avgTotal/100).toFixed(2)}` : '—'} 
          sub={loading ? 'Carregando...' : stats.avg > 0 ? 'Média do mês' : stats.avgTotal > 0 ? 'Média geral' : 'Sem dados'} 
        />
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-neutral-300">Últimos Orçamentos</h2>
            <Link to="/app/orcamentos" className="text-xs text-brand-400 hover:text-brand-300">Ver todos</Link>
          </div>
          <div className="rounded-xl bg-neutral-900 ring-1 ring-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-4 font-medium">Cliente</th>
                  <th className="py-2 px-4 font-medium">Valor</th>
                  <th className="py-2 px-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="py-8 text-center text-neutral-500">Carregando...</td></tr>
                ) : stats.last5.map((q: UserQuote) => (
                  <tr key={q.id} className="border-b border-neutral-900 last:border-0 hover:bg-neutral-800/40">
                    <td className="py-2 px-4">{q.client_name}</td>
                    <td className="py-2 px-4">R$ {(q.total/100).toFixed(2)}</td>
                    <td className="py-2 px-4 text-neutral-400">{new Date(q.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {!loading && stats.last5.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-neutral-500">Nenhum orçamento ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300">
            {stats.inMonthCount > 0 ? 'Atividade (orçamentos no mês)' : 'Atividade (últimos meses)'}
          </h2>
          <div className="p-4 rounded-xl bg-neutral-900 ring-1 ring-neutral-800">
            <div className="h-40 relative">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                  Carregando dados...
                </div>
              ) : (
                <canvas ref={canvasRef} className="w-full h-full" />
              )}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
              <span>
                {loading ? '...' : stats.inMonthCount > 0 
                  ? now.toLocaleDateString('pt-BR', { month: 'short' })
                  : 'Últimos 3 meses'
                }
              </span>
              <span>
                {loading ? '...' : stats.inMonthCount > 0 
                  ? `${stats.dailyCounts.filter(d=>d.count).reduce((a,b)=>a+b.count,0)} orçs.`
                  : `${userQuotes.length} orçs.`
                }
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/orcamentos/novo" className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-xs font-medium text-white">Novo Orçamento</Link>
              <Link to="/app/configuracoes" className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-medium">Adicionar Campo</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface StatProps { label: string; value: string | number; sub?: string; icon?: React.ReactNode }
const StatCard = ({ label, value, sub, icon }: StatProps) => (
  <div className="p-5 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-neutral-500 font-medium">{label}</span>
      {icon && <span className="text-brand-400">{icon}</span>}
    </div>
    <div className="text-2xl font-semibold leading-none">{value}</div>
    {sub && <div className="text-xs text-neutral-500">{sub}</div>}
  </div>
);
