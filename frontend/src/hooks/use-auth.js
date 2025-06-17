import React from "react";
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

  /* ---------------------------------------------------------------------- */
  /*  Restore session ONCE after first mount (React-18 safe)                */
  /* ---------------------------------------------------------------------- */
  React.useEffect(() => {
    const tok = getToken();
    if (!user && tok) {
      api
        .get("/me")
        .then((r) => setUser(r.data))
        .catch(() => clearToken()); // invalid / expired token
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps -> only once

  return { user, login, signup, logout };
}
