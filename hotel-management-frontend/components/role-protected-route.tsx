"use client"

import { useAuth } from "@/contexts/auth-context"
import { useUserRole } from "@/hooks/use-user-role"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface RoleProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: string[]
    redirectTo?: string
}

export default function RoleProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/unauthorized"
}: RoleProtectedRouteProps) {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const { role, loading: roleLoading } = useUserRole()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !roleLoading) {
            if (!isAuthenticated) {
                router.push("/login")
                return
            }

            if (role && !allowedRoles.includes(role)) {
                router.push(redirectTo)
                return
            }
        }
    }, [isAuthenticated, role, authLoading, roleLoading, router, allowedRoles, redirectTo])

    // Show loading while checking authentication and role
    if (authLoading || roleLoading) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <Skeleton className="h-9 w-96 mx-auto" />
                    <Skeleton className="h-5 w-64 mx-auto" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Don't render if not authenticated or not authorized
    if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
        return null
    }

    return <>{children}</>
}
