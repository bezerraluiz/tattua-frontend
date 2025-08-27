export interface LoginResponse {
  error: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  }
}

export interface RegisterResponse {
  error: boolean;
  data: {
    id: string;
  }
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
    return {
      error: true,
      data: {
        accessToken: "",
        refreshToken: ""
      }
    };
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
    const response = await fetch("http://localhost:3333/api/v1/users", requestOptions);
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

