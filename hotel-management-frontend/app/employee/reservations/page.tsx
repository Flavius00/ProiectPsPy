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
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit
} from "lucide-react"

// Mock data - in real app this would come from your API
const mockReservations = [
    {
        id: "res-001",
        clientName: "John Doe",
        clientEmail: "john@example.com",
        roomNumber: "101",
        hotelName: "Grand Hotel",
        checkIn: "2024-12-01",
        checkOut: "2024-12-05",
        status: "pending",
        totalAmount: 480,
        notes: "Early check-in requested"
    },
    {
        id: "res-002",
        clientName: "Jane Smith",
        clientEmail: "jane@example.com",
        roomNumber: "205",
        hotelName: "City Center Hotel",
        checkIn: "2024-12-02",
        checkOut: "2024-12-04",
        status: "confirmed",
        totalAmount: 320,
        notes: ""
    },
    {
        id: "res-003",
        clientName: "Bob Johnson",
        clientEmail: "bob@example.com",
        roomNumber: "310",
        hotelName: "Beach Resort",
        checkIn: "2024-11-28",
        checkOut: "2024-12-02",
        status: "completed",
        totalAmount: 600,
        notes: "VIP guest"
    }
]

export default function EmployeeReservationsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
            case "confirmed":
                return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>
            case "completed":
                return <Badge variant="outline" className="text-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
            case "cancelled":
                return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleStatusChange = (reservationId: string, newStatus: string) => {
        console.log(`Changing reservation ${reservationId} to ${newStatus}`)
        // TODO: Implement API call to update reservation status
    }

    const filteredReservations = mockReservations.filter(reservation => {
        const matchesSearch = reservation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.roomNumber.includes(searchTerm)
        const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">All Reservations</h1>
                    <p className="text-muted-foreground">Manage and view all hotel reservations</p>
                </div>
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
                                    placeholder="Search by client name, email, or room number..."
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
                                variant={statusFilter === "pending" ? "default" : "outline"}
                                onClick={() => setStatusFilter("pending")}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={statusFilter === "confirmed" ? "default" : "outline"}
                                onClick={() => setStatusFilter("confirmed")}
                            >
                                Confirmed
                            </Button>
                            <Button
                                variant={statusFilter === "completed" ? "default" : "outline"}
                                onClick={() => setStatusFilter("completed")}
                            >
                                Completed
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reservations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
                    <CardDescription>
                        Showing {filteredReservations.length} of {mockReservations.length} reservations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reservation ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Hotel & Room</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReservations.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell className="font-medium">{reservation.id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{reservation.clientName}</div>
                                            <div className="text-sm text-muted-foreground">{reservation.clientEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{reservation.hotelName}</div>
                                            <div className="text-sm text-muted-foreground">Room {reservation.roomNumber}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>In: {reservation.checkIn}</div>
                                            <div>Out: {reservation.checkOut}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                                    <TableCell className="font-medium">${reservation.totalAmount}</TableCell>
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
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Notes
                                                </DropdownMenuItem>
                                                {reservation.status === "pending" && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, "confirmed")}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Confirm
                                                    </DropdownMenuItem>
                                                )}
                                                {(reservation.status === "pending" || reservation.status === "confirmed") && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, "cancelled")}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                                {reservation.status === "confirmed" && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, "completed")}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark Complete
                                                    </DropdownMenuItem>
                                                )}
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
