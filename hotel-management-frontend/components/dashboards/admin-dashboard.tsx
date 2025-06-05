"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import { getAuthHeader } from "@/lib/auth"
import {
    Shield,
    Users,
    Building,
    Database,
    Settings,
    BarChart3,
    UserCheck,
    Key,
    Activity,
    AlertTriangle,
    Edit,
    Trash2,
    Download,
    Loader2,
    Search
} from "lucide-react"

// User interface based on backend DTOs
interface UserResponse {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    phone_number?: string
    date_of_birth?: string
    role: string
    status: string
    preferences?: any
    created_at: string
    updated_at: string
}

// User update request interface
interface UserUpdateRequest {
    first_name?: string
    last_name?: string
    role?: string
    status?: string
}

export default function AdminDashboard() {
    const { toast } = useToast()

    // Loading states
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<UserResponse[]>([])

    // Update user related state
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false)
    const [isLoadingUserUpdate, setIsLoadingUserUpdate] = useState(false)
    const [userSearchTerm, setUserSearchTerm] = useState("")

    // Delete user related state
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
    const [isLoadingUserDelete, setIsLoadingUserDelete] = useState(false)
    const [deleteUserSearchTerm, setDeleteUserSearchTerm] = useState("")

    // Export related state
    const [isLoadingExport, setIsLoadingExport] = useState(false)

    // User update form state
    const [userUpdateForm, setUserUpdateForm] = useState({
        first_name: "",
        last_name: "",
        role: "",
        status: "active"
    })

    // User Management Functions
    const handleListAllUsers = async () => {
        setIsLoading(true)
        try {
            // Using the admin endpoint to get all users
            const endpoint = API_ROUTES.USERS.ADMIN.LIST
            const response = await apiClient<UserResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle different possible response formats
            const usersList = Array.isArray(response) ? response : []

            setUsers(usersList)
            toast({
                title: "Success",
                description: `Retrieved ${usersList.length} users`,
            })

            console.log("Retrieved users:", response)

        } catch (error) {
            console.error("Error fetching users:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch users",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearUsers = () => {
        setUsers([])
        toast({
            title: "Cleared",
            description: "Users view has been cleared",
        })
    }

    const handleOpenUpdateUserDialog = () => {
        setIsUpdateUserDialogOpen(true)
        // If no users are loaded, get all users first
        if (users.length === 0) {
            handleListAllUsers()
        }
    }

    const handleSelectUser = (userId: string) => {
        setSelectedUser(userId)
        const user = users.find(u => u.id === userId)
        if (user) {
            // Pre-populate the form with current user data
            setUserUpdateForm({
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                status: user.status
            })
        }
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUser) {
            toast({
                title: "Error",
                description: "Please select a user to update",
                variant: "destructive",
            })
            return
        }

        setIsLoadingUserUpdate(true)
        try {
            const endpoint = API_ROUTES.USERS.ADMIN.UPDATE(selectedUser)

            // Prepare update request - only send fields that have changed
            const updateRequest: UserUpdateRequest = {}
            const currentUser = users.find(u => u.id === selectedUser)

            if (currentUser) {
                if (userUpdateForm.first_name !== currentUser.first_name) {
                    updateRequest.first_name = userUpdateForm.first_name
                }
                if (userUpdateForm.last_name !== currentUser.last_name) {
                    updateRequest.last_name = userUpdateForm.last_name
                }
                if (userUpdateForm.role !== currentUser.role) {
                    updateRequest.role = userUpdateForm.role
                }
                if (userUpdateForm.status !== currentUser.status) {
                    updateRequest.status = userUpdateForm.status
                }
            }

            const response = await apiClient<UserResponse>(endpoint, {
                method: "PUT",
                requireAuth: true,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateRequest),
            })

            // Update the user in the local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === selectedUser ? response : user
                )
            )

            setIsUpdateUserDialogOpen(false)
            setSelectedUser("")
            setUserUpdateForm({
                first_name: "",
                last_name: "",
                role: "",
                status: "active"
            })

            toast({
                title: "Success",
                description: "User updated successfully",
            })

        } catch (error) {
            console.error("Error updating user:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user",
                variant: "destructive",
            })
        } finally {
            setIsLoadingUserUpdate(false)
        }
    }

    const handleOpenDeleteUserDialog = () => {
        setIsDeleteUserDialogOpen(true)
        // If no users are loaded, get all users first
        if (users.length === 0) {
            handleListAllUsers()
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) {
            toast({
                title: "Error",
                description: "Please select a user to delete",
                variant: "destructive",
            })
            return
        }

        setIsLoadingUserDelete(true)
        try {
            const endpoint = API_ROUTES.USERS.ADMIN.DELETE(selectedUser)

            await apiClient(endpoint, {
                method: "DELETE",
                requireAuth: true,
            })

            // Remove the user from the local state
            setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser))

            setIsDeleteUserDialogOpen(false)
            setSelectedUser("")

            toast({
                title: "Success",
                description: "User deleted successfully",
            })

        } catch (error) {
            console.error("Error deleting user:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete user",
                variant: "destructive",
            })
        } finally {
            setIsLoadingUserDelete(false)
        }
    }

    const handleExportUsers = async () => {
        setIsLoadingExport(true)
        try {
            const endpoint = API_ROUTES.USERS.ADMIN.EXPORT

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    ...getAuthHeader(),
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Get the CSV content
            const csvContent = await response.text()

            // Create a download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)

            link.setAttribute("href", url)
            link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            URL.revokeObjectURL(url)

            toast({
                title: "Success",
                description: "Users exported successfully as CSV",
            })

        } catch (error) {
            console.error("Error exporting users:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to export users",
                variant: "destructive",
            })
        } finally {
            setIsLoadingExport(false)
        }
    }

    // Filter functions
    const filteredUsers = users.filter(user =>
        userSearchTerm === "" ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(userSearchTerm.toLowerCase())
    )

    const filteredUsersForDelete = users.filter(user =>
        deleteUserSearchTerm === "" ||
        user.email.toLowerCase().includes(deleteUserSearchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(deleteUserSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(deleteUserSearchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(deleteUserSearchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
                <p className="text-muted-foreground">Full system control and management</p>
            </div>

            {/* User Management Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    User Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                List All Users
                            </CardTitle>
                            <CardDescription>
                                View all users in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={handleListAllUsers}
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "View Users"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="w-5 h-5" />
                                Update User
                            </CardTitle>
                            <CardDescription>
                                Modify user information and roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isUpdateUserDialogOpen} onOpenChange={setIsUpdateUserDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={handleOpenUpdateUserDialog}>
                                        Update User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Update User Information
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a user and update their information
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* User Selection */}
                                        <div className="space-y-3">
                                            <Label htmlFor="user-search">Select User</Label>
                                            <Input
                                                id="user-search"
                                                placeholder="Search users by name, email, or role..."
                                                value={userSearchTerm}
                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                            />

                                            {filteredUsers.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredUsers.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedUser === user.id ? 'bg-primary/10' : ''
                                                                }`}
                                                            onClick={() => handleSelectUser(user.id)}
                                                        >
                                                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                                            <div className="text-xs text-muted-foreground">Role: {user.role}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {users.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No users loaded. Users will be loaded automatically when you open this dialog.
                                                </p>
                                            )}
                                        </div>

                                        {/* User Update Form */}
                                        {selectedUser && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-first-name">First Name *</Label>
                                                        <Input
                                                            id="user-first-name"
                                                            value={userUpdateForm.first_name}
                                                            onChange={(e) => setUserUpdateForm(prev => ({ ...prev, first_name: e.target.value }))}
                                                            placeholder="Enter first name"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-last-name">Last Name *</Label>
                                                        <Input
                                                            id="user-last-name"
                                                            value={userUpdateForm.last_name}
                                                            onChange={(e) => setUserUpdateForm(prev => ({ ...prev, last_name: e.target.value }))}
                                                            placeholder="Enter last name"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-role">Role *</Label>
                                                        <Select
                                                            value={userUpdateForm.role}
                                                            onValueChange={(value) => setUserUpdateForm(prev => ({ ...prev, role: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CLIENT">Client</SelectItem>
                                                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-status">Status</Label>
                                                        <Select
                                                            value={userUpdateForm.status}
                                                            onValueChange={(value) => setUserUpdateForm(prev => ({ ...prev, status: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">Active</SelectItem>
                                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={handleUpdateUser}
                                                        disabled={isLoadingUserUpdate}
                                                        className="flex-1"
                                                    >
                                                        {isLoadingUserUpdate ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            'Update User'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsUpdateUserDialogOpen(false)}
                                                        disabled={isLoadingUserUpdate}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Delete User
                            </CardTitle>
                            <CardDescription>
                                Remove users from the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleOpenDeleteUserDialog}
                                    >
                                        Delete User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-destructive" />
                                            Delete User
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a user to permanently delete from the system. This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <Label htmlFor="delete-user-search">Select User to Delete</Label>
                                            <Input
                                                id="delete-user-search"
                                                placeholder="Search users by name, email, or role..."
                                                value={deleteUserSearchTerm}
                                                onChange={(e) => setDeleteUserSearchTerm(e.target.value)}
                                            />

                                            {filteredUsersForDelete.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredUsersForDelete.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedUser === user.id ? 'bg-destructive/10' : ''
                                                                }`}
                                                            onClick={() => setSelectedUser(user.id)}
                                                        >
                                                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                                            <div className="text-xs text-muted-foreground">Role: {user.role}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {users.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No users loaded. Users will be loaded automatically when you open this dialog.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteUser}
                                                disabled={!selectedUser || isLoadingUserDelete}
                                                className="flex-1"
                                            >
                                                {isLoadingUserDelete ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete User'
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsDeleteUserDialogOpen(false)
                                                    setSelectedUser("")
                                                }}
                                                disabled={isLoadingUserDelete}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Export Users
                            </CardTitle>
                            <CardDescription>
                                Download users list as CSV file
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={handleExportUsers}
                                disabled={isLoadingExport}
                            >
                                {isLoadingExport ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export as CSV
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Display fetched users */}
            {users.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>System Users ({users.length})</CardTitle>
                                    <CardDescription>All users in the system</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearUsers}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-4 border rounded-lg bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Name:</strong>
                                                    <p className="text-sm">{user.first_name} {user.last_name}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Email:</strong>
                                                    <p className="text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Role:</strong>
                                                    <p className="text-sm">{user.role}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Status:</strong>
                                                    <p className={`text-sm ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {user.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">User ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{user.id}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Created:</strong>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
