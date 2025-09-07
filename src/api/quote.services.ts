import { apiRequestJson } from '../utils/apiRequest';

export interface QuotePayload {
  client_name: string;
  professional_name: string;
  tattoo_size: string;
  difficulty: string;
  body_region: string;
  colors_quantity: string;
  needle_fill: string;
  estimated_hours: number;
  description?: string;
  total: number;
  custom_fields?: Record<string, any>;
  user_uid: string;
}

export interface QuoteResponse {
  error: boolean;
  data?: any;
  message?: string;
}

export const CreateQuote = async (payload: QuotePayload): Promise<QuoteResponse> => {
  try {
    const result = await apiRequestJson<QuoteResponse>({
      url: 'http://localhost:3333/api/v1/quotes',
      method: 'POST',
      body: payload
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao criar orçamento.',
    };
  }
};

export const GetQuotesByUserUid = async (user_uid: string): Promise<QuoteResponse> => {
  try {
    const result = await apiRequestJson<QuoteResponse>({
      url: `http://localhost:3333/api/v1/quotes/user?user_uid=${user_uid}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao buscar orçamentos.',
    };
  }
};