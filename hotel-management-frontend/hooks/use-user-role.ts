"use client"

import { useAuth } from "@/contexts/auth-context"

export type UserRole = 'client' | 'employee' | 'manager' | 'admin'

export function useUserRole(): {
    role: UserRole | null
    isClient: boolean
    isEmployee: boolean
    isManager: boolean
    isAdmin: boolean
    loading: boolean
} {
    const { user, loading } = useAuth()

    const role = user?.role?.toLowerCase() as UserRole | null

    return {
        role,
        isClient: role === 'client',
        isEmployee: role === 'employee',
        isManager: role === 'manager',
        isAdmin: role === 'admin',
        loading
    }
}
