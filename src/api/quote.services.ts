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
  user_id: number;
}

export interface QuoteResponse {
  error: boolean;
  data?: any;
  message?: string;
}

export const CreateQuote = async (payload: QuotePayload): Promise<QuoteResponse> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  };

  try {
    const response = await fetch("http://localhost:3333/api/v1/quotes", requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao criar orçamento.',
    };
  }
};