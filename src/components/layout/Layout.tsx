import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useToast } from '../../store/toast';

const ToastContainer = () => {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 w-72">
      {toasts.map(t => (
        <div key={t.id} className={`text-sm rounded-md px-4 py-3 shadow-lg border flex items-start gap-3 animate-fade-in-up ${t.type==='success'?'bg-emerald-600/20 border-emerald-600/40 text-emerald-200': t.type==='error'?'bg-red-600/20 border-red-600/40 text-red-200':'bg-neutral-700/60 border-neutral-600 text-neutral-100'}` }>
          <span className="flex-1">{t.message}</span>
          <button onClick={()=>dismiss(t.id)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-sm text-neutral-500">© {new Date().getFullYear()} Tattua</footer>
      <ToastContainer />
    </div>
  );
};
