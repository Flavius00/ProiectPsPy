"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  getCurrentUser,
  isLoggedIn,
  loginUser,
  logoutUser,
  registerUser,
  setToken,
} from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      setLoading(true)
      console.log("Checking authentication...")
      try {
        const tokenExists = isLoggedIn()
        console.log("Token exists:", tokenExists)

        if (tokenExists) {
          const currentUser = await getCurrentUser()
          console.log("Current user:", currentUser)

          if (currentUser) {
            setUser(currentUser)
            setIsAuthenticated(true)
            console.log("User authenticated successfully")
          } else {
            setIsAuthenticated(false)
            console.log("Failed to get current user")
          }
        } else {
          setIsAuthenticated(false)
          console.log("No valid token found")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [mounted])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const response = await loginUser(username, password)
      setToken(response.access_token)

      // If user data is included in the response, use it
      if (response.user) {
        setUser(response.user)
        // Store user in localStorage for other components to access
        if (mounted && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } else {
        // Otherwise fetch the user data
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          // Store user in localStorage for other components to access
          if (mounted && typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      }

      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      await registerUser(username, email, password)
      // After registration, we don't automatically log in
      // The user will need to log in with their credentials
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
      setIsAuthenticated(false)

      // Remove user data from localStorage
      if (mounted && typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local state
      setUser(null)
      setIsAuthenticated(false)

      // Remove user data from localStorage
      if (mounted && typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
