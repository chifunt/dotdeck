"use client"

import type { User } from "@/types"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/lib/axios-instance"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  signup: (token: string, userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("authUser")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("authToken", newToken)
    localStorage.setItem("authUser", JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
  }

  const signup = (newToken: string, userData: User) => {
    // Signup might be the same as login in terms of setting local state
    login(newToken, userData)
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authUser")
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common["Authorization"]
    router.push("/") // Redirect to homepage on logout
    router.refresh() // Ensure server components re-render
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, signup }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
