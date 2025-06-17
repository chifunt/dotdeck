/**
 * @file Centralised authentication hook – handles JWT persistence,
 * login/signup/logout mutations and exposes a reactive `user`.
 */

import { useEffect } from "react";
import { atom, useAtom } from "jotai";

import { api } from "@/lib/axios-client";
import { getToken, setToken, clearToken } from "@/utils/auth-storage";

/** Global jotai atom so the user is shared across the entire SPA. */
const userAtom = atom(/** @type{import("@/types").User|null} */ (null));

/**
 * React hook that provides the current `user` + helpers:
 * `login`, `signup`, `logout`.
 *
 * Internally it will:
 *  • store/remove the JWT in `localStorage`
 *  • restore the session on first mount (if a token already exists)
 */
export function useAuth() {
  const [user, setUser] = useAtom(userAtom);

  /* ───────────────────────────── Mutations ───────────────────────────── */

  /** Login with e-mail + password – persisting the JWT. */
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
  };

  /** Sign up + immediate login (same response envelope). */
  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    setToken(data.token);
    setUser(data.user);
  };

  /** Wipe token + local state; used by user action or 401 interceptor. */
  const logout = () => {
    clearToken();
    setUser(null);
  };

  /* ───────────────────── Session re-hydration (once) ─────────────────── */
  useEffect(() => {
    const token = getToken();
    if (!user && token) {
      api
        .get("/me")
        .then((r) => setUser(r.data))
        .catch(() => clearToken()); // silently drop invalid / expired JWT
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run exactly once after first mount

  return { user, login, signup, logout };
}
