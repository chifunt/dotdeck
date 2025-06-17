/**
 * @file Axios singleton with JWT & 401 handling baked-in.
 */

import axios from "axios";
import { getToken, clearToken } from "@/utils/auth-storage";

/** Pre-configured instance pointing at the Vite proxy (`/api/v1`). */
export const api = axios.create({ baseURL: "/api/v1" });

/*───────────────────────────── Request JWT ―───────────────────────────────*/
/** Attaches `Authorization: Bearer <JWT>` header when the token is present. */
api.interceptors.request.use((config) => {
  const jwt = getToken();
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

/*──────────────────────────── Response 401 ―───────────────────────────────*/
/**
 * Global error handler:
 * • Clears stale token on 401 so the next request is anonymous.
 * • Re-throws every error so per-call `.catch()` still works.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) clearToken();
    return Promise.reject(err);
  },
);
