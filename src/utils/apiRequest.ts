import { getAccessToken, refreshAccessToken, clearAccessToken } from '../supabase/api/user';

export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Faz uma requisição para a API com auto-refresh do token
 * Se receber 401, tenta renovar o token e fazer a requisição novamente
 */
export async function apiRequest(config: ApiRequestConfig): Promise<Response> {
  const { url, method = 'GET', body, headers = {} } = config;
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('Token de acesso não encontrado');
  }

  // Primeira tentativa
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...headers
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    redirect: 'follow'
  };

  if (body && method !== 'GET') {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response = await fetch(url, requestOptions);

  // Se recebeu 401, tenta renovar o token
  if (response.status === 401) {
    console.log('Recebido 401, tentando renovar token...');
    
    const renewed = await refreshAccessToken();
    if (renewed) {
      console.log('Token renovado, tentando requisição novamente...');
      
      // Atualiza o header com o novo token
      const newToken = getAccessToken();
      if (newToken) {
        requestHeaders.Authorization = `Bearer ${newToken}`;
        requestOptions.headers = requestHeaders;
        
        // Tenta a requisição novamente
        response = await fetch(url, requestOptions);
      }
    }
    
    // Se ainda está 401 após tentar renovar, limpa tokens e redireciona
    if (response.status === 401) {
      console.log('Ainda recebendo 401 após renovar token, fazendo logout...');
      clearAccessToken();
      
      try {
        // Importar dinamicamente para evitar dependência circular
        const { useAuth } = await import('../store/auth');
        useAuth.getState().logout();
      } catch {}
      
      // Redireciona para login
      setTimeout(() => { window.location.href = '/login'; }, 100);
      
      throw new Error('Sessão expirada. Redirecionando para login...');
    }
  }

  return response;
}

/**
 * Wrapper para fazer requisições JSON com auto-refresh
 */
export async function apiRequestJson<T = any>(config: ApiRequestConfig): Promise<T> {
  const response = await apiRequest(config);
  return response.json();
}
