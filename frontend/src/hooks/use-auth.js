import { atom, useAtom } from "jotai";
import { api } from "../lib/axios-client";
import { setToken, clearToken, getToken } from "../utils/auth-storage";

const userAtom = atom(null);

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // try restore on first use
  if (!user && getToken()) {
    api
      .get("/me")
      .then((r) => setUser(r.data))
      .catch(() => clearToken());
  }

  return { user, login, signup, logout };
}
