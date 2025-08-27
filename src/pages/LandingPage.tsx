import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { CheckCircle2, FileText, Settings, CreditCard, Sparkles } from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  return (
    <div className="pt-10">
      <Hero logged={!!user} />
      <Features />
      <Pricing />
      <CTA />
    </div>
  );
};

const Hero = ({ logged }: { logged: boolean }) => (
  <section className="grid lg:grid-cols-2 gap-10 items-center">
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
        Gerencie orçamentos do seu estúdio de tatuagem com rapidez.
      </h1>
      <p className="text-neutral-400 text-lg max-w-lg">Tattua centraliza criação de orçamentos, controle de plano e configuração de serviços em uma interface moderna e intuitiva.</p>
      {!logged && (
        <div className="flex gap-4">
          <Link to="/register" className="px-6 py-3 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium">Começar agora</Link>
          <Link to="/login" className="px-6 py-3 rounded-md border border-neutral-700 text-neutral-200 hover:border-neutral-500">Entrar</Link>
        </div>
      )}
    </div>
    <div className="relative">
      <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-neutral-800 bg-neutral-900 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 p-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 w-24 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 text-xs font-medium">
              <Sparkles className="w-5 h-5 text-brand-500"/>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-600/20 blur-3xl rounded-full" />
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-400/20 blur-3xl rounded-full" />
    </div>
  </section>
);

const Features = () => (
  <section className="mt-24">
    <h2 className="text-2xl font-bold mb-8">Funcionalidades principais</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { icon: FileText, title: 'Orçamentos Dinâmicos', desc: 'Campos configuráveis com cálculo automático do valor total.' },
        { icon: Settings, title: 'Campos Personalizados', desc: 'Adicione opções com valores ou campos de texto.' },
        { icon: CreditCard, title: 'Plano Simples', desc: 'Plano mensal único de R$80, fácil de gerenciar.' },
      ].map(f => (
        <div key={f.title} className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800">
          <f.icon className="w-7 h-7 text-brand-500 mb-4" />
          <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const Pricing = () => (
  <section className="mt-24">
    <h2 className="text-2xl font-bold mb-8">Preço</h2>
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-4 text-neutral-400 text-sm leading-relaxed">
        <p>Sem complicação de planos múltiplos. Um valor único para acesso completo ao sistema Tattua.</p>
        <ul className="space-y-2">
          {['Orçamentos ilimitados', 'Campos personalizados', 'Exportação PDF', 'Atualizações contínuas'].map(item => (
            <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500"/>{item}</li>
          ))}
        </ul>
      </div>
      <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 flex flex-col">
        <div className="text-3xl font-bold text-white">R$80<span className="text-lg font-medium text-neutral-500">/mês</span></div>
        <p className="text-xs text-neutral-500 mt-2">Plano único. Cancelar quando quiser.</p>
        <Link to="/register" className="mt-6 px-4 py-3 text-center rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium">Assinar agora</Link>
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="mt-32 text-center">
    <h2 className="text-3xl font-bold mb-4">Pronto para simplificar seus orçamentos?</h2>
    <p className="text-neutral-400 mb-8">Crie sua conta e comece a usar em menos de 2 minutos.</p>
    <Link to="/register" className="px-8 py-4 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium">Criar conta</Link>
  </section>
);
