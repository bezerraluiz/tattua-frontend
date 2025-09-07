import { supabase } from '../supabaseClient';

let ACCESS_TOKEN: string | null = null;
let REFRESH_TOKEN: string | null = null;

// Salva o token no localStorage e em memória
export function setAccessToken(token: string) {
  ACCESS_TOKEN = token;
  localStorage.setItem('access_token', token);
}

// Salva o refresh token no localStorage e em memória
export function setRefreshToken(token: string) {
  REFRESH_TOKEN = token;
  localStorage.setItem('refresh_token', token);
}

// Obtém o access token atual
export function getAccessToken(): string | null {
  return ACCESS_TOKEN;
}

// Obtém o refresh token atual
export function getRefreshToken(): string | null {
  return REFRESH_TOKEN;
}

// Remove os tokens do localStorage e da memória
export function clearAccessToken() {
  ACCESS_TOKEN = null;
  REFRESH_TOKEN = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Tenta renovar o access token usando o refresh token
export async function refreshAccessToken(): Promise<boolean> {
  if (!REFRESH_TOKEN) {
    console.warn('Nenhum refresh_token disponível.');
    return false;
  }

  try {
    const response = await fetch('http://localhost:3333/api/v1/users/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: REFRESH_TOKEN
      })
    });

    const result = await response.json();
    
    if (!response.ok || result.error) {
      console.error('Erro ao renovar token:', result);
      return false;
    }

    // Salvar os novos tokens
    if (result.data?.access_token) {
      setAccessToken(result.data.access_token);
    }
    if (result.data?.refresh_token) {
      setRefreshToken(result.data.refresh_token);
    }

    return true;
  } catch (error) {
    console.error('Erro na requisição de refresh:', error);
    return false;
  }
}

// Restaura os tokens do localStorage ao iniciar
if (typeof window !== 'undefined') {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (accessToken) {
    ACCESS_TOKEN = accessToken;
  }
  if (refreshToken) {
    REFRESH_TOKEN = refreshToken;
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
    // Verifica se é erro de token expirado e tenta renovar
    const msg = error?.message || String(error);
    if (msg?.toLowerCase().includes('token is expired') || msg?.toLowerCase().includes('invalid jwt')) {
      console.log('Token expirado, tentando renovar...');
      
      // Tenta renovar o token
      const renewed = await refreshAccessToken();
      if (renewed) {
        console.log('Token renovado com sucesso, tentando novamente...');
        // Tenta novamente com o novo token
        const { data: newData, error: newError } = await supabase.auth.getUser(ACCESS_TOKEN);
        if (!newError && newData.user?.id) {
          return newData.user.id;
        }
      }
      
      // Se chegou aqui, não conseguiu renovar ou ainda há erro
      console.log('Falha ao renovar token, fazendo logout...');
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
