// Remove o token do localStorage e da memória
export function clearAccessToken() {
  ACCESS_TOKEN = null;
  localStorage.removeItem('access_token');
}
import { supabase } from '../supabaseClient';

let ACCESS_TOKEN: string | null = null;

// Salva o token no localStorage e em memória
export function setAccessToken(token: string) {
  ACCESS_TOKEN = token;
  localStorage.setItem('access_token', token);
}

// Restaura o token do localStorage ao iniciar
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token');
  if (token) {
    ACCESS_TOKEN = token;
  }
}

// Função para obter o user id usando o access_token armazenado
export async function getCurrentUserId() {
  if (!ACCESS_TOKEN) {
    console.warn('Nenhum access_token em memória. Usuário não autenticado.');
    return null;
  }
  const { data, error } = await supabase.auth.getUser(ACCESS_TOKEN);
  if (error) {
    console.error('Erro ao obter usuário:', error);
    // Verifica se é erro de token expirado e faz logout automático
    const msg = error?.message || String(error);
    if (msg?.toLowerCase().includes('token is expired') || msg?.toLowerCase().includes('invalid jwt')) {
      clearAccessToken();
      try {
        // Importar dinamicamente para evitar dependência circular
        const { useAuth } = await import('../../store/auth');
        useAuth.getState().logout();
      } catch {}
      // Redireciona para login
      setTimeout(() => { window.location.href = '/login'; }, 100);
    }
    return null;
  }
  return data.user?.id || null;
}
