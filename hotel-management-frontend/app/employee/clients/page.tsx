"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Calendar,
    Mail,
    Phone,
    User
} from "lucide-react"

// Mock data - in real app this would come from your API
const mockClients = [
    {
        id: "client-001",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1-555-0123",
        totalReservations: 5,
        lastReservation: "2024-11-15",
        status: "active",
        joinDate: "2024-01-15"
    },
    {
        id: "client-002",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1-555-0456",
        totalReservations: 12,
        lastReservation: "2024-11-28",
        status: "active",
        joinDate: "2023-08-22"
    },
    {
        id: "client-003",
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "+1-555-0789",
        totalReservations: 3,
        lastReservation: "2024-10-05",
        status: "inactive",
        joinDate: "2024-03-10"
    },
    {
        id: "client-004",
        name: "Alice Williams",
        email: "alice@example.com",
        phone: "+1-555-0321",
        totalReservations: 8,
        lastReservation: "2024-11-30",
        status: "active",
        joinDate: "2023-12-01"
    }
]

export default function EmployeeClientsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="outline" className="text-green-600">Active</Badge>
            case "inactive":
                return <Badge variant="outline" className="text-gray-600">Inactive</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleViewReservations = (clientId: string) => {
        console.log(`View reservations for client: ${clientId}`)
        // TODO: Navigate to reservations page filtered by client
    }

    const filteredClients = mockClients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        const matchesStatus = statusFilter === "all" || client.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Client Management</h1>
                    <p className="text-muted-foreground">View and manage client accounts</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                                <p className="text-2xl font-bold">{mockClients.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <User className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                                <p className="text-2xl font-bold">
                                    {mockClients.filter(c => c.status === "active").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
                                <p className="text-2xl font-bold">
                                    {mockClients.reduce((sum, client) => sum + client.totalReservations, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <User className="h-4 w-4 text-orange-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                                <p className="text-2xl font-bold">3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === "all" ? "default" : "outline"}
                                onClick={() => setStatusFilter("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === "active" ? "default" : "outline"}
                                onClick={() => setStatusFilter("active")}
                            >
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === "inactive" ? "default" : "outline"}
                                onClick={() => setStatusFilter("inactive")}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Clients ({filteredClients.length})</CardTitle>
                    <CardDescription>
                        Showing {filteredClients.length} of {mockClients.length} clients
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Reservations</TableHead>
                                <TableHead>Last Reservation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Member Since</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">{client.id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {client.email}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {client.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{client.totalReservations}</Badge>
                                    </TableCell>
                                    <TableCell>{client.lastReservation}</TableCell>
                                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                                    <TableCell>{client.joinDate}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleViewReservations(client.id)}>
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    View Reservations
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
