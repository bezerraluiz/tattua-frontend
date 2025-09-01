import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, LayoutDashboard, Settings, FileText, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { clearAccessToken } from '../../supabase/api/user';

const navLinkClass = ({ isActive }: { isActive: boolean }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}`;

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hideAuthButtons = ['/esqueci-senha', '/resetar-senha'].includes(location.pathname);
  
  const handleLogout = () => {
    clearAccessToken();
    logout(); 
    navigate('/'); 
  };
  
  return (
    <nav className="w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? '/app' : '/'} className="font-bold text-lg text-white flex items-center gap-2" aria-label="Tattua Home">
          <span className="bg-gradient-to-r from-brand-400 to-brand-600 text-transparent bg-clip-text">Tattua</span>
        </Link>
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/app" end className={navLinkClass}><LayoutDashboard className="w-4 h-4 mr-1 inline"/>Dashboard</NavLink>
            <NavLink to="/app/orcamentos" className={navLinkClass}><FileText className="w-4 h-4 mr-1 inline"/>Orçamentos</NavLink>
            <NavLink to="/app/billing" className={navLinkClass}><CreditCard className="w-4 h-4 mr-1 inline"/>Plano</NavLink>
            <NavLink to="/app/configuracoes" className={navLinkClass}><Settings className="w-4 h-4 mr-1 inline"/>Config.</NavLink>
            <NavLink to="/app/perfil" className={navLinkClass}><User className="w-4 h-4 mr-1 inline"/>Perfil</NavLink>
          </div>
        )}
        <div className="flex items-center gap-3">
          {!user && !hideAuthButtons && (
            <>
              <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 px-3 py-2 rounded-md"><LogIn className="w-4 h-4"/>Login</Link>
              <Link to="/register" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-white px-3 py-2">Criar conta</Link>
            </>
          )}
          {user && (
            <button onClick={handleLogout} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white px-3 py-2"><LogOut className="w-4 h-4"/>Sair</button>
          )}
        </div>
      </div>
    </nav>
  );
};
