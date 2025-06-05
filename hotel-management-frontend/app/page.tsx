"use client"

import { useUserRole } from "@/hooks/use-user-role"
import { useAuth } from "@/contexts/auth-context"
import ClientDashboard from "@/components/dashboards/client-dashboard"
import EmployeeDashboard from "@/components/dashboards/employee-dashboard"
import ManagerDashboard from "@/components/dashboards/manager-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { role, loading: roleLoading } = useUserRole()

  // Show loading skeleton while checking authentication and role
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

  // If not authenticated, show a generic welcome message
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Hotel Chain Management</h1>
          <p className="text-muted-foreground">Please log in to access your dashboard</p>
        </div>
      </div>
    )
  }

  // Show role-specific dashboard
  switch (role) {
    case 'employee':
      return <EmployeeDashboard />
    case 'client':
      return <ClientDashboard />
    case 'manager':
      return <ManagerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <ClientDashboard />
  }
}
