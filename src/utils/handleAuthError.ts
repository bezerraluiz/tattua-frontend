import { clearAccessToken, refreshAccessToken } from '../supabase/api/user';
import { useAuth } from '../store/auth';
import { useProfile } from '../store/profile';

/**
 * Verifica se o erro de autenticação é devido a token expirado/invalid JWT.
 * Tenta renovar o token primeiro, se falhar faz logout imediato.
 * Exemplo de uso:
 *   try { ... } catch(e) { handleAuthError(e, push) }
 */
export async function handleAuthError(
  error: any,
  push?: (msg: { type: 'error' | 'success' | 'info'; message: string }) => void
): Promise<boolean> {
  const msg = error?.message || error?.error_description || error?.error || String(error);
  if (
    msg?.toLowerCase().includes('token is expired') ||
    msg?.toLowerCase().includes('invalid jwt') ||
    msg?.toLowerCase().includes('sessão expirada')
  ) {
    console.log('Erro de autenticação detectado, tentando renovar token...');
    
    // Tenta renovar o token primeiro
    const renewed = await refreshAccessToken();
    if (renewed) {
      console.log('Token renovado com sucesso');
      if (push) push({ type: 'info', message: 'Token renovado automaticamente.' });
      return false; // Indica que não precisa fazer logout
    }
    
    // Se chegou aqui, não conseguiu renovar
    console.log('Falha ao renovar token, fazendo logout...');
    clearAccessToken();
    
    try {
      // Limpar dados sensíveis dos stores
      useAuth.getState().logout();
      useProfile.getState().clearProfile();
    } catch {}
    
    if (push) push({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
    
    // Redireciona para login
    setTimeout(() => { window.location.href = '/login'; }, 100);
    return true; // Indica que fez logout
  }
  return false; // Não é erro de autenticação
}
