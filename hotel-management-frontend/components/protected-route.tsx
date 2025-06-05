"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { hasRole } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return

    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (requiredRole && !hasRole(requiredRole)) {
      console.log("User doesn't have required role, redirecting to unauthorized")
      router.push("/unauthorized")
    }
  }, [isAuthenticated, loading, requiredRole, router, pathname, mounted])

  // Show loading state while checking authentication
  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
