import axios from "axios";
import { getToken, clearToken } from "../utils/auth-storage";

export const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) clearToken();
    return Promise.reject(err);
  },
);
