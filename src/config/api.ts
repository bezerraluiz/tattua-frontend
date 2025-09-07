// Configuração da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: 'http://localhost:3333/api/v1',
  
  // Se deve usar dados mock quando a API não estiver disponível
  USE_FALLBACK_DATA: true,
  
  // Timeout para requisições (em ms)
  REQUEST_TIMEOUT: 10000,
};

// Endpoints da API
export const API_ENDPOINTS = {
  // Usuários
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  REFRESH: '/users/refresh',
  USER_PROFILE: '/users/', // GET com ?user_uid= para buscar
  USER_UPDATE: '/users/update', // PATCH para atualizar
  
  // Orçamentos
  QUOTES: '/quotes',
  QUOTES_BY_USER: '/quotes/user',
};

// Função para obter URL completa do endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para verificar se deve usar fallback
export const shouldUseFallback = (): boolean => {
  return API_CONFIG.USE_FALLBACK_DATA;
};
