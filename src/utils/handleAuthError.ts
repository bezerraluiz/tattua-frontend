import { clearAccessToken } from '../supabase/api/user';
import { useAuth } from '../store/auth';

/**
 * Verifica se o erro de autenticação é devido a token expirado/invalid JWT e faz logout imediato.
 * Pode ser usado em catch ou após chamada de getCurrentUserId.
 * Exemplo de uso:
 *   try { ... } catch(e) { handleAuthError(e, push) }
 */
export function handleAuthError(
  error: any,
  push?: (msg: { type: 'error' | 'success' | 'info'; message: string }) => void
) {
  const msg = error?.message || error?.error_description || error?.error || String(error);
  if (
    msg?.toLowerCase().includes('token is expired') ||
    msg?.toLowerCase().includes('invalid jwt')
  ) {
    clearAccessToken();
    try {
      // Chama logout do store auth
      useAuth.getState().logout();
    } catch {}
    if (push) push({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
    // Redireciona para login
    setTimeout(() => { window.location.href = '/login'; }, 100);
    return true;
  }
  return false;
}
