import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useState, useEffect } from "react";
import {
  LoginUser,
  type ErrorResponse,
  type LoginResponse,
} from "../api/user.services";
import { useToast } from "../../store/toast";

export const LoginPage = () => {
  const { login } = useAuth();
  const { push } = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Tratamento de erro de verificação expirada
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const error = params.get("error_description");
    if (error) {
      // Redireciona para /erro se for token expirado ou link inválido
      if (
        error.toLowerCase().includes("expired") ||
        error.toLowerCase().includes("invalid")
      ) {
        nav("/erro" + window.location.search, { replace: true });
      } else {
        push({ type: "error", message: error });
      }
    }
  }, [nav, push]);

  const LoginUserHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      push({ type: "error", message: "Preencha email e senha." });
      return;
    }

    setLoading(true);
    try {
      const payload = { email, password };

      const response: LoginResponse | ErrorResponse = await LoginUser(payload);

      if (response.error) {
        push({
          type: "error",
          message: "Email ou senha inválidos. Verifique suas credenciais.",
        });
      } else {
        // Login com sucesso
        login({ email, name: "Usuário" });
        push({ type: "success", message: "Login realizado com sucesso!" });
        nav("/app");
      }
    } catch (error) {
      push({ type: "error", message: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-neutral-900 rounded-xl ring-1 ring-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>
      <form className="space-y-4" onSubmit={LoginUserHandler}>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
      <p className="text-xs text-neutral-500 mt-6">
        Não tem conta?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
};
