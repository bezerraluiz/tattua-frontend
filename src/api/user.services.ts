import { apiRequestJson } from '../utils/apiRequest';

export interface LoginResponse {
  error: boolean;
  data: {
    access_token: string;
    refresh_token: string;
  }
}

export interface RegisterResponse {
  error: boolean;
  data: {
    id: string;
  }
}

export interface UserResponse {
  error: boolean;
  data?: {
    id: number;
    uid: string;
    studio_name: string;
    email: string;
    tax_id: string;
    telephone?: string;
    country?: string;
    street?: string;
    number?: string;
    complement?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  message?: string;
}

export interface UserAddressResponse {
  error: boolean;
  data?: {
    id: number;
    user_id: number;
    country: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zip_code: string;
    created_at: string;
    updated_at: string;
  } | Array<{
    id: number;
    user_id: number;
    country: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zip_code: string;
    created_at: string;
    updated_at: string;
  }>;
  message?: string;
}

export interface ErrorResponse {
  error: boolean;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  studio_name: string;
  email: string;
  tax_id: string;
  password: string;
  telephone?: string;
  country: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zip_code: string;
}

export const LoginUser = async (payload: LoginPayload): Promise<LoginResponse | ErrorResponse> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email: payload.email,
    password: payload.password,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  };

  try {
    const response = await fetch("http://localhost:3333/api/v1/users/login", requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return error instanceof Error ? { error: true, message: error.message } : { error: true, message: 'Erro ao fazer login.' };
  }
};

export const RegisterUser = async (payload: RegisterPayload): Promise<RegisterResponse | ErrorResponse> => {
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
    const response = await fetch("http://localhost:3333/api/v1/users/register", requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao registrar usuário.',
    };
  }
};

export const GetUser = async (user_uid: string): Promise<UserResponse> => {
  try {
    const result = await apiRequestJson<UserResponse>({
      url: `http://localhost:3333/api/v1/users?user_uid=${user_uid}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao buscar perfil do usuário.',
    };
  }
};

export const GetUserAddress = async (user_id: number): Promise<UserAddressResponse> => {
  try {
    const result = await apiRequestJson<UserAddressResponse>({
      url: `http://localhost:3333/api/v1/addresses/user?user_id=${user_id}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao buscar endereço do usuário.',
    };
  }
};

export interface UpdateUserPayload {
  password?: string;
  studio_name?: string;
  email?: string;
  tax_id?: string;
  telephone?: string;
}

export interface UpdateAddressPayload {
  user_id: number; // Será enviado via URL params
  country?: string;
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export const UpdateUser = async (uid: string, payload: UpdateUserPayload): Promise<UserResponse> => {
  try {
    const result = await apiRequestJson<UserResponse>({
      url: `http://localhost:3333/api/v1/users/update?uid=${uid}`,
      method: 'PATCH',
      body: payload
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao atualizar usuário.',
    };
  }
};

export const UpdateUserAddress = async (payload: UpdateAddressPayload): Promise<UserAddressResponse> => {
  try {
    // Separar user_id para enviar via params, e o resto via body
    const { user_id, ...bodyPayload } = payload;

    const result = await apiRequestJson<UserAddressResponse>({
      url: `http://localhost:3333/api/v1/addresses/update?user_id=${user_id}`,
      method: 'PATCH',
      body: bodyPayload
    });
    
    return result;
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Erro ao atualizar endereço.',
    };
  }
};