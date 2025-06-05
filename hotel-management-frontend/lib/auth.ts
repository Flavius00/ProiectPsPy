import { jwtDecode } from "jwt-decode"
import { API_ROUTES } from "./config"

export interface User {
  id: string
  email: string
  username: string
  role: string
  is_active?: boolean
  is_verified?: boolean
  status?: string
}

export interface DecodedToken {
  sub: string
  email: string
  role: string
  exp: number
  iat: number
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in?: number
  user?: User
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(API_ROUTES.AUTH.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: username, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Login failed")
  }

  const data = await response.json()

  // Normalize the token response structure
  // Some backends might use different key naming conventions
  const tokenData: LoginResponse = {
    access_token: data.access_token || data.token || data.accessToken || '',
    token_type: data.token_type || data.tokenType || 'bearer',
    expires_in: data.expires_in || data.expiresIn || 1800, // Default 30 min
    user: data.user || null,
  }

  // If user data is not included in the response, we'll need to fetch it separately
  if (!tokenData.user) {
    setToken(tokenData.access_token)
    try {
      const userData = await getCurrentUser()
      return {
        ...tokenData,
        user: userData || undefined,
      }
    } catch (error) {
      console.error("Failed to fetch user data after login:", error)
      return tokenData
    }
  }

  return tokenData
}

export async function registerUser(username: string, email: string, password: string): Promise<any> {
  // Log the request payload for debugging
  console.log("Registration payload:", { username, email, password })

  const response = await fetch(API_ROUTES.AUTH.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Ensure we're sending exactly what the backend expects
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Registration error response:", errorData)

    // Handle validation errors more specifically
    if (response.status === 422 && errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        // Format validation errors nicely
        const errorMessages = errorData.detail.map((err: any) => `${err.field}: ${err.message}`).join(", ")
        throw new Error(`Validation error: ${errorMessages}`)
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map((err: any) => `${err.field}: ${err.message}`).join(", ")
        throw new Error(`Validation error: ${errorMessages}`)
      } else {
        throw new Error(errorData.detail)
      }
    }

    throw new Error(errorData.detail || "Registration failed")
  }

  return await response.json()
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken") || localStorage.getItem("token")
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("accessToken", token)
  // Ensure backward compatibility
  localStorage.setItem("token", token)
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("token")
}

export function getDecodedToken(): DecodedToken | null {
  const token = getToken()
  if (!token) return null

  try {
    return jwtDecode<DecodedToken>(token)
  } catch (error) {
    console.error("Failed to decode token:", error)
    removeToken()
    return null
  }
}

export function isLoggedIn(): boolean {
  const decoded = getDecodedToken()
  if (!decoded) return false

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000)
  if (decoded.exp < currentTime) {
    removeToken()
    return false
  }

  return true
}

export function getUserRole(): string | null {
  const decoded = getDecodedToken()
  return decoded?.role || null
}

export function hasRole(requiredRole: string): boolean {
  const userRole = getUserRole()
  if (!userRole) return false

  // Role hierarchy: ADMIN > MANAGER > EMPLOYEE > CLIENT
  const roleHierarchy: Record<string, number> = {
    ADMIN: 4,
    MANAGER: 3,
    EMPLOYEE: 2,
    CLIENT: 1,
  }

  const userRoleLevel = roleHierarchy[userRole] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0

  return userRoleLevel >= requiredRoleLevel
}

export function logout(): void {
  removeToken()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

export async function logoutUser(): Promise<void> {
  const token = getToken()

  try {
    // Call backend logout endpoint
    if (token) {
      await fetch(API_ROUTES.AUTH.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    }
  } catch (error) {
    console.error("Error calling logout endpoint:", error)
    // Continue with logout even if backend call fails
  } finally {
    // Always remove token and redirect regardless of backend response
    removeToken()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}

export function getAuthHeader(): HeadersInit {
  const token = getToken()

  if (!token) {
    console.warn("No access token found when authentication is required")
    return {}
  }

  console.log("Using token for authentication:", token.substring(0, 20) + "...")
  return { Authorization: `Bearer ${token}` }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken()
  if (!token) return null

  try {
    const response = await fetch(API_ROUTES.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeToken()
        return null
      }
      throw new Error("Failed to get current user")
    }

    // Log the response for debugging
    const userData = await response.json()
    console.log("Current user data:", userData)

    return userData
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
