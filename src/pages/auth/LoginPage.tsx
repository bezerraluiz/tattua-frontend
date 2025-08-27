import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { useState } from 'react';

export const LoginPage = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login({ email });
    nav('/app');
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
        <button className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium">Entrar</button>
      </form>
      <p className="text-xs text-neutral-500 mt-6">Não tem conta? <Link to="/register" className="text-brand-400 hover:text-brand-300">Cadastre-se</Link></p>
    </div>
  );
};
