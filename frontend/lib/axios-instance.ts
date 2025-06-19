import axios from "axios"

// For local development, set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1 in your .env.local
// For production, this can be /api/v1 if your hosting handles proxying, or the full production API URL.
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"

export const api = axios.create({
  baseURL: baseURL,
})

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
