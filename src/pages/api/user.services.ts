export interface LoginResponse {
  error: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  }
}

export const LoginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email,
    password,
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
