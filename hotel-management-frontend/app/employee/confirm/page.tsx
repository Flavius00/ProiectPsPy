"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Eye
} from "lucide-react"

// Mock data - in real app this would come from your API
const mockPendingReservations = [
    {
        id: "res-001",
        clientName: "John Doe",
        clientEmail: "john@example.com",
        roomNumber: "101",
        hotelName: "Grand Hotel",
        checkIn: "2024-12-01",
        checkOut: "2024-12-05",
        totalAmount: 480,
        notes: "Early check-in requested",
        requestedDate: "2024-11-25"
    },
    {
        id: "res-005",
        clientName: "Sarah Wilson",
        clientEmail: "sarah@example.com",
        roomNumber: "203",
        hotelName: "City Center Hotel",
        checkIn: "2024-12-03",
        checkOut: "2024-12-06",
        totalAmount: 360,
        notes: "Honeymoon suite requested",
        requestedDate: "2024-11-26"
    },
    {
        id: "res-008",
        clientName: "Mike Brown",
        clientEmail: "mike@example.com",
        roomNumber: "505",
        hotelName: "Beach Resort",
        checkIn: "2024-12-10",
        checkOut: "2024-12-15",
        totalAmount: 800,
        notes: "Business trip, require WiFi and workspace",
        requestedDate: "2024-11-27"
    }
]

export default function EmployeeConfirmPage() {
    const [selectedReservation, setSelectedReservation] = useState<any>(null)
    const [confirmationNotes, setConfirmationNotes] = useState("")
    const [isConfirming, setIsConfirming] = useState(false)

    const handleConfirmReservation = async (reservationId: string, notes?: string) => {
        setIsConfirming(true)

        // Simulate API call
        setTimeout(() => {
            console.log(`Confirming reservation ${reservationId} with notes: ${notes}`)
            // TODO: Implement actual API call
            setIsConfirming(false)
            setSelectedReservation(null)
            setConfirmationNotes("")
        }, 1000)
    }

    const handleRejectReservation = async (reservationId: string, reason: string) => {
        console.log(`Rejecting reservation ${reservationId} with reason: ${reason}`)
        // TODO: Implement actual API call
    }

    const getDaysFromRequest = (requestedDate: string) => {
        const requested = new Date(requestedDate)
        const now = new Date()
        const diffTime = now.getTime() - requested.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getPriorityBadge = (days: number) => {
        if (days >= 3) {
            return <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgent
            </Badge>
        } else if (days >= 2) {
            return <Badge variant="outline" className="text-orange-600">
                High Priority
            </Badge>
        } else {
            return <Badge variant="outline" className="text-green-600">
                Normal
            </Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Confirm Reservations</h1>
                    <p className="text-muted-foreground">Review and approve pending reservations</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Pending Reservations</p>
                                <p className="text-2xl font-bold">{mockPendingReservations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Urgent (3+ days)</p>
                                <p className="text-2xl font-bold">
                                    {mockPendingReservations.filter(r => getDaysFromRequest(r.requestedDate) >= 3).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue Pending</p>
                                <p className="text-2xl font-bold">
                                    ${mockPendingReservations.reduce((sum, r) => sum + r.totalAmount, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Reservations */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Reservations</CardTitle>
                    <CardDescription>
                        Reservations waiting for confirmation. Prioritize older requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Priority</TableHead>
                                <TableHead>Reservation</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Hotel & Room</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPendingReservations
                                .sort((a, b) => getDaysFromRequest(b.requestedDate) - getDaysFromRequest(a.requestedDate))
                                .map((reservation) => {
                                    const daysFromRequest = getDaysFromRequest(reservation.requestedDate)
                                    return (
                                        <TableRow key={reservation.id}>
                                            <TableCell>{getPriorityBadge(daysFromRequest)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{reservation.id}</div>
                                                    {reservation.notes && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Note: {reservation.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
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
                                            <TableCell className="font-medium">${reservation.totalAmount}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{reservation.requestedDate}</div>
                                                    <div className="text-muted-foreground">
                                                        {daysFromRequest} day{daysFromRequest !== 1 ? 's' : ''} ago
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setSelectedReservation(reservation)}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Confirm
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Confirm Reservation</DialogTitle>
                                                                <DialogDescription>
                                                                    Review the reservation details and add any confirmation notes.
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            {selectedReservation && (
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <strong>Client:</strong> {selectedReservation.clientName}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Email:</strong> {selectedReservation.clientEmail}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Hotel:</strong> {selectedReservation.hotelName}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Room:</strong> {selectedReservation.roomNumber}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Check-in:</strong> {selectedReservation.checkIn}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Check-out:</strong> {selectedReservation.checkOut}
                                                                        </div>
                                                                    </div>

                                                                    {selectedReservation.notes && (
                                                                        <div>
                                                                            <strong>Client Notes:</strong>
                                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                                {selectedReservation.notes}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <label className="text-sm font-medium">Confirmation Notes (Optional)</label>
                                                                        <Textarea
                                                                            placeholder="Add any notes for the client or internal use..."
                                                                            value={confirmationNotes}
                                                                            onChange={(e) => setConfirmationNotes(e.target.value)}
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <DialogFooter>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedReservation(null)
                                                                        setConfirmationNotes("")
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    onClick={() => selectedReservation && handleConfirmReservation(selectedReservation.id, confirmationNotes)}
                                                                    disabled={isConfirming}
                                                                >
                                                                    {isConfirming ? "Confirming..." : "Confirm Reservation"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button variant="outline" size="sm">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>

                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button className="h-auto p-4 flex flex-col items-center gap-2">
                            <CheckCircle className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Confirm All Priority</div>
                                <div className="text-sm text-muted-foreground">Confirm all high priority reservations</div>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                            <Eye className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Review Details</div>
                                <div className="text-sm text-muted-foreground">Bulk review reservation details</div>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                            <XCircle className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Bulk Reject</div>
                                <div className="text-sm text-muted-foreground">Reject multiple reservations</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
