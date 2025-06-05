import RoleProtectedRoute from "@/components/role-protected-route"

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleProtectedRoute allowedRoles={['employee', 'admin']}>
            {children}
        </RoleProtectedRoute>
    )
}
