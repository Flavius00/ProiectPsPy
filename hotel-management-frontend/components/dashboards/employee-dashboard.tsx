"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Users,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Settings,
    ClipboardList,
    User,
    Bed,
    Edit,
    MessageSquare,
    Loader2
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import { useToast } from "@/hooks/use-toast"

// Types based on backend DTOs
interface ReservationResponse {
    id: string
    room_id: string
    client_id?: string
    client_email: string
    client_name: string
    employee_id?: string
    check_in_date: string
    check_out_date: string
    total_price: number
    status: "pending" | "confirmed" | "cancelled" | "completed"
    notes?: string
    created_at: string
    updated_at: string
}

interface ReservationListResponse {
    reservations: ReservationResponse[]
    total: number
    skip: number
    limit: number
}

// Room interface for room data structure
interface Room {
    id: string
    name: string
    number: string
    type?: string
}

// Update Reservation Status DTOs
interface UpdateReservationStatusRequest {
    status: "pending" | "confirmed" | "cancelled" | "completed"
    notes?: string
}

// User Management Service DTOs
interface UserResponse {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    phone_number?: string
    role: string
    status: string
    created_at: string
    updated_at: string
}

interface UsersListResponse {
    users?: UserResponse[]
    total?: number
}

export default function EmployeeDashboard() {
    const [isLoading, setIsLoading] = useState(false)
    const [reservations, setReservations] = useState<ReservationResponse[]>([])

    // Client-related state
    const [clients, setClients] = useState<UserResponse[]>([])
    const [selectedClient, setSelectedClient] = useState<string>("")
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
    const [isLoadingClients, setIsLoadingClients] = useState(false)
    const [clientSearchTerm, setClientSearchTerm] = useState("")

    // Room-related state
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedRoom, setSelectedRoom] = useState<string>("")
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
    const [isLoadingRooms, setIsLoadingRooms] = useState(false)
    const [roomSearchTerm, setRoomSearchTerm] = useState("")

    // Update status related state
    const [selectedReservation, setSelectedReservation] = useState<string>("")
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
    const [statusSearchTerm, setStatusSearchTerm] = useState("")
    const [newStatus, setNewStatus] = useState<"pending" | "confirmed" | "cancelled" | "completed">("confirmed")
    const [statusNotes, setStatusNotes] = useState("")

    const { toast } = useToast()

    const handleGetAllReservations = async () => {
        setIsLoading(true)
        try {
            const response = await apiClient<ReservationListResponse>(
                API_ROUTES.RESERVATIONS.EMPLOYEE.LIST,
                {
                    method: "GET",
                    requireAuth: true,
                },
                { skip: 0, limit: 100 } // Pagination parameters
            )

            setReservations(response.reservations)
            toast({
                title: "Success",
                description: `Retrieved ${response.total} reservations`,
            })

            // Log the data for debugging
            console.log("Retrieved reservations:", response)

        } catch (error) {
            console.error("Error fetching reservations:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch reservations",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGetClients = async () => {
        setIsLoadingClients(true)
        try {
            // Get all reservations first to extract client information from Hotel Service
            const response = await apiClient<ReservationListResponse>(
                API_ROUTES.RESERVATIONS.EMPLOYEE.LIST,
                {
                    method: "GET",
                    requireAuth: true,
                },
                { skip: 0, limit: 1000 } // Get more to capture all clients
            )

            // Extract unique clients from reservations
            const uniqueClients = response.reservations.reduce((acc, reservation) => {
                const clientKey = reservation.client_id || reservation.client_email
                if (!acc.some(client => client.id === clientKey)) {
                    acc.push({
                        id: reservation.client_id || reservation.client_email, // Use client_id if available, fallback to email
                        email: reservation.client_email,
                        username: reservation.client_name,
                        first_name: reservation.client_name.split(' ')[0] || '',
                        last_name: reservation.client_name.split(' ').slice(1).join(' ') || '',
                        phone_number: '',
                        role: 'client',
                        status: 'active',
                        created_at: '',
                        updated_at: ''
                    })
                }
                return acc
            }, [] as UserResponse[])

            setClients(uniqueClients)

            toast({
                title: "Success",
                description: `Found ${uniqueClients.length} clients with reservations`,
            })

        } catch (error) {
            console.error("Error fetching clients:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch clients from reservations",
                variant: "destructive",
            })
        } finally {
            setIsLoadingClients(false)
        }
    }

    const handleGetRooms = async () => {
        setIsLoadingRooms(true)
        try {
            // Get all reservations first to extract room information from Hotel Service
            const response = await apiClient<ReservationListResponse>(
                API_ROUTES.RESERVATIONS.EMPLOYEE.LIST,
                {
                    method: "GET",
                    requireAuth: true,
                },
                { skip: 0, limit: 1000 } // Get more to capture all rooms
            )

            // Extract unique rooms from reservations
            const uniqueRooms = response.reservations.reduce((acc, reservation) => {
                if (!acc.some(room => room.id === reservation.room_id)) {
                    acc.push({
                        id: reservation.room_id,
                        name: `Room ${reservation.room_id}`,
                        number: reservation.room_id,
                        type: 'Standard' // Default type since we don't have room details in reservations
                    })
                }
                return acc
            }, [] as Room[])

            setRooms(uniqueRooms)

            toast({
                title: "Success",
                description: `Found ${uniqueRooms.length} rooms with reservations`,
            })

        } catch (error) {
            console.error("Error fetching rooms:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch rooms from reservations",
                variant: "destructive",
            })
        } finally {
            setIsLoadingRooms(false)
        }
    }

    const handleGetSpecificReservation = async () => {
        if (!selectedClient) {
            toast({
                title: "Error",
                description: "Please select a client first",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            // Use the client reservation endpoint with the selected client ID
            const endpoint = API_ROUTES.RESERVATIONS.EMPLOYEE.CLIENT_RESERVATIONS(selectedClient)

            const response = await apiClient<ReservationResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle the response - it might be an array or wrapped in an object
            const reservationsData = Array.isArray(response) ? response : []
            setReservations(reservationsData)

            const client = clients.find(c => c.id === selectedClient)
            const clientName = client ? `${client.first_name} ${client.last_name}` : selectedClient

            toast({
                title: "Success",
                description: `Retrieved ${reservationsData.length} reservations for ${clientName}`,
            })

            setIsClientDialogOpen(false)
            setSelectedClient("")

        } catch (error) {
            console.error("Error fetching client reservations:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch client reservations",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGetRoomReservations = async () => {
        if (!selectedRoom) {
            toast({
                title: "Error",
                description: "Please select a room first",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            // Use the room reservation endpoint with the selected room ID
            const endpoint = API_ROUTES.RESERVATIONS.EMPLOYEE.ROOM_RESERVATIONS(selectedRoom)

            const response = await apiClient<ReservationResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle the response - it might be an array or wrapped in an object
            const reservationsData = Array.isArray(response) ? response : []
            setReservations(reservationsData)

            const room = rooms.find(r => r.id === selectedRoom)
            const roomName = room ? room.name : `Room ${selectedRoom}`

            toast({
                title: "Success",
                description: `Retrieved ${reservationsData.length} reservations for ${roomName}`,
            })

            setIsRoomDialogOpen(false)
            setSelectedRoom("")

        } catch (error) {
            console.error("Error fetching room reservations:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch room reservations",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenClientDialog = () => {
        setIsClientDialogOpen(true)
        if (clients.length === 0) {
            handleGetClients()
        }
    }

    const handleOpenRoomDialog = () => {
        setIsRoomDialogOpen(true)
        if (rooms.length === 0) {
            handleGetRooms()
        }
    }

    const handleUpdateReservationStatus = async () => {
        if (!selectedReservation) {
            toast({
                title: "Error",
                description: "Please select a reservation first",
                variant: "destructive",
            })
            return
        }

        if (!newStatus) {
            toast({
                title: "Error",
                description: "Please select a status",
                variant: "destructive",
            })
            return
        }

        setIsLoadingUpdate(true)
        try {
            // Create the update request payload
            const updateRequest: UpdateReservationStatusRequest = {
                status: newStatus,
                notes: statusNotes.trim() || undefined
            }

            // Use the status update endpoint
            const endpoint = `${API_ROUTES.RESERVATIONS.EMPLOYEE.UPDATE(selectedReservation)}/status`

            const response = await apiClient<ReservationResponse>(endpoint, {
                method: "PATCH",
                requireAuth: true,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateRequest)
            })

            // Update the reservation in the current list if it exists
            setReservations(prev => prev.map(reservation =>
                reservation.id === selectedReservation
                    ? { ...reservation, status: newStatus, notes: statusNotes.trim() || reservation.notes }
                    : reservation
            ))

            const reservation = reservations.find(r => r.id === selectedReservation)
            const reservationInfo = reservation ? `${reservation.client_name} (${reservation.id})` : selectedReservation

            toast({
                title: "Success",
                description: `Updated reservation status to "${newStatus}" for ${reservationInfo}`,
            })

            // Reset dialog state
            setIsStatusDialogOpen(false)
            setSelectedReservation("")
            setNewStatus("confirmed")
            setStatusNotes("")

        } catch (error) {
            console.error("Error updating reservation status:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update reservation status",
                variant: "destructive",
            })
        } finally {
            setIsLoadingUpdate(false)
        }
    }

    const handleOpenStatusDialog = () => {
        setIsStatusDialogOpen(true)
        // If no reservations are loaded, get all reservations first
        if (reservations.length === 0) {
            handleGetAllReservations()
        }
    }

    const filteredClients = clients.filter(client =>
        clientSearchTerm === "" ||
        client.first_name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.last_name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.username.toLowerCase().includes(clientSearchTerm.toLowerCase())
    )

    const filteredRooms = rooms.filter(room =>
        roomSearchTerm === "" ||
        room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
        room.number.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
        room.id.toLowerCase().includes(roomSearchTerm.toLowerCase())
    )

    const filteredReservations = reservations.filter(reservation =>
        statusSearchTerm === "" ||
        reservation.id.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
        reservation.client_name.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
        reservation.client_email.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
        reservation.room_id.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
        reservation.status.toLowerCase().includes(statusSearchTerm.toLowerCase())
    )

    const handleClearReservations = () => {
        setReservations([])
        toast({
            title: "Cleared",
            description: "Reservations view has been cleared",
        })
    }
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Employee Dashboard</h1>
                <p className="text-muted-foreground">Manage reservations and assist clients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* View Reservations */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            View Reservations
                        </CardTitle>
                        <CardDescription>Browse and manage all reservations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleGetAllReservations}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Get All Reservations"
                            )}
                        </Button>

                        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={handleOpenClientDialog}
                                    disabled={isLoading}
                                >
                                    Get Specific Reservation
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Select Client</DialogTitle>
                                    <DialogDescription>
                                        Choose a client to view their reservations
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Search clients by name, email, or username..."
                                            value={clientSearchTerm}
                                            onChange={(e) => setClientSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {isLoadingClients ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="ml-2">Loading clients...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {filteredClients.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-4">
                                                    {clientSearchTerm ? "No clients match your search" : "No clients found"}
                                                </p>
                                            ) : (
                                                filteredClients.map((client) => (
                                                    <div
                                                        key={client.id}
                                                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${selectedClient === client.id ? "border-primary bg-primary/10" : ""
                                                            }`}
                                                        onClick={() => setSelectedClient(client.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {client.first_name} {client.last_name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {client.email}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    @{client.username}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end space-y-1">
                                                                <Badge variant="outline">
                                                                    {client.status}
                                                                </Badge>
                                                                {client.phone_number && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {client.phone_number}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsClientDialogOpen(false)
                                                setSelectedClient("")
                                                setClientSearchTerm("")
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleGetSpecificReservation}
                                            disabled={!selectedClient || isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                "Get Reservations"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={handleOpenRoomDialog}
                                    disabled={isLoading}
                                >
                                    Get Room Reservations
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Select Room</DialogTitle>
                                    <DialogDescription>
                                        Choose a room to view its reservations
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Search rooms by name, number, or ID..."
                                            value={roomSearchTerm}
                                            onChange={(e) => setRoomSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {isLoadingRooms ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="ml-2">Loading rooms...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {filteredRooms.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-4">
                                                    {roomSearchTerm ? "No rooms match your search" : "No rooms found"}
                                                </p>
                                            ) : (
                                                filteredRooms.map((room) => (
                                                    <div
                                                        key={room.id}
                                                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${selectedRoom === room.id ? "border-primary bg-primary/10" : ""
                                                            }`}
                                                        onClick={() => setSelectedRoom(room.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {room.name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Room Number: {room.number}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    ID: {room.id}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end space-y-1">
                                                                <Badge variant="outline">
                                                                    {room.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsRoomDialogOpen(false)
                                                setSelectedRoom("")
                                                setRoomSearchTerm("")
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleGetRoomReservations}
                                            disabled={!selectedRoom || isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                "Get Reservations"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Update Reservations */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Update Reservations
                        </CardTitle>
                        <CardDescription>Modify reservation details and status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={handleOpenStatusDialog}
                                    disabled={isLoading}
                                >
                                    Update Reservation Status
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Update Reservation Status</DialogTitle>
                                    <DialogDescription>
                                        Select a reservation and update its status
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Search reservations by ID, client, email, room, or status..."
                                            value={statusSearchTerm}
                                            onChange={(e) => setStatusSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="ml-2">Loading reservations...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {filteredReservations.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-4">
                                                    {statusSearchTerm ? "No reservations match your search" : "No reservations available. Load reservations first."}
                                                </p>
                                            ) : (
                                                filteredReservations.map((reservation) => (
                                                    <div
                                                        key={reservation.id}
                                                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${selectedReservation === reservation.id ? "border-primary bg-primary/10" : ""
                                                            }`}
                                                        onClick={() => setSelectedReservation(reservation.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium">
                                                                    {reservation.client_name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Room: {reservation.room_id} | ID: {reservation.id}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end space-y-1">
                                                                <Badge variant={
                                                                    reservation.status === 'confirmed' ? 'default' :
                                                                        reservation.status === 'pending' ? 'secondary' :
                                                                            reservation.status === 'cancelled' ? 'destructive' :
                                                                                'outline'
                                                                }>
                                                                    {reservation.status}
                                                                </Badge>
                                                                <p className="text-xs text-muted-foreground">
                                                                    ${reservation.total_price.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {selectedReservation && (
                                        <div className="space-y-4 border-t pt-4">
                                            <div>
                                                <label className="text-sm font-medium">New Status</label>
                                                <Select value={newStatus} onValueChange={(value: "pending" | "confirmed" | "cancelled" | "completed") => setNewStatus(value)}>
                                                    <SelectTrigger className="w-full mt-1">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium">Notes (Optional)</label>
                                                <Textarea
                                                    placeholder="Add notes about the status change..."
                                                    value={statusNotes}
                                                    onChange={(e) => setStatusNotes(e.target.value)}
                                                    className="w-full mt-1"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsStatusDialogOpen(false)
                                                setSelectedReservation("")
                                                setStatusSearchTerm("")
                                                setNewStatus("confirmed")
                                                setStatusNotes("")
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleUpdateReservationStatus}
                                            disabled={!selectedReservation || isLoadingUpdate}
                                        >
                                            {isLoadingUpdate ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                "Update Status"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            {/* Display fetched reservations */}
            {reservations.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Fetched Reservations ({reservations.length})</CardTitle>
                                    <CardDescription>Latest reservations data from the backend</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearReservations}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {reservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="p-4 border rounded-lg bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <strong>ID:</strong> {reservation.id}
                                            </div>
                                            <div>
                                                <strong>Client:</strong> {reservation.client_name}
                                            </div>
                                            <div>
                                                <strong>Room:</strong> {reservation.room_id}
                                            </div>
                                            <div>
                                                <strong>Status:</strong>
                                                <span className={`ml-1 px-2 py-1 rounded text-xs ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {reservation.status}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>Check-in:</strong> {new Date(reservation.check_in_date).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <strong>Check-out:</strong> {new Date(reservation.check_out_date).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <strong>Total:</strong> ${reservation.total_price.toFixed(2)}
                                            </div>
                                            <div>
                                                <strong>Client Email:</strong> {reservation.client_email}
                                            </div>
                                        </div>
                                        {reservation.notes && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <strong>Notes:</strong> {reservation.notes}
                                            </div>
                                        )}
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
