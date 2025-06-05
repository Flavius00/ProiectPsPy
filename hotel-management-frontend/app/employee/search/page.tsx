"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    User,
    Calendar,
    Hotel,
    Eye,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react"

export default function EmployeeSearchPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)

    // Mock search function
    const handleSearch = async () => {
        if (!searchTerm.trim()) return

        setIsSearching(true)

        // Simulate API call
        setTimeout(() => {
            setSearchResults({
                reservations: [
                    {
                        id: "res-001",
                        clientName: "John Doe",
                        roomNumber: "101",
                        hotelName: "Grand Hotel",
                        checkIn: "2024-12-01",
                        checkOut: "2024-12-05",
                        status: "pending"
                    }
                ],
                clients: [
                    {
                        id: "client-001",
                        name: "John Doe",
                        email: "john@example.com",
                        phone: "+1-555-0123",
                        totalReservations: 5
                    }
                ],
                rooms: [
                    {
                        id: "room-101",
                        number: "101",
                        hotelName: "Grand Hotel",
                        type: "Standard",
                        status: "occupied"
                    }
                ]
            })
            setIsSearching(false)
        }, 1000)
    }

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quick Search</h1>
                <p className="text-muted-foreground">Search for reservations, clients, or rooms</p>
            </div>

            {/* Search Bar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search
                    </CardTitle>
                    <CardDescription>
                        Search by reservation ID, client name, email, room number, or phone number
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter search term..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                            {isSearching ? "Searching..." : "Search"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>
                            Found {(searchResults.reservations?.length || 0) + (searchResults.clients?.length || 0) + (searchResults.rooms?.length || 0)} results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="reservations" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="reservations" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Reservations ({searchResults.reservations?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="clients" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Clients ({searchResults.clients?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="rooms" className="flex items-center gap-2">
                                    <Hotel className="h-4 w-4" />
                                    Rooms ({searchResults.rooms?.length || 0})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="reservations" className="space-y-4">
                                {searchResults.reservations?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reservation ID</TableHead>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Hotel & Room</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {searchResults.reservations.map((reservation: any) => (
                                                <TableRow key={reservation.id}>
                                                    <TableCell className="font-medium">{reservation.id}</TableCell>
                                                    <TableCell>{reservation.clientName}</TableCell>
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
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No reservations found
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="clients" className="space-y-4">
                                {searchResults.clients?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Client ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Reservations</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {searchResults.clients.map((client: any) => (
                                                <TableRow key={client.id}>
                                                    <TableCell className="font-medium">{client.id}</TableCell>
                                                    <TableCell>{client.name}</TableCell>
                                                    <TableCell>{client.email}</TableCell>
                                                    <TableCell>{client.phone}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{client.totalReservations}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No clients found
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="rooms" className="space-y-4">
                                {searchResults.rooms?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Room ID</TableHead>
                                                <TableHead>Room Number</TableHead>
                                                <TableHead>Hotel</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {searchResults.rooms.map((room: any) => (
                                                <TableRow key={room.id}>
                                                    <TableCell className="font-medium">{room.id}</TableCell>
                                                    <TableCell>{room.number}</TableCell>
                                                    <TableCell>{room.hotelName}</TableCell>
                                                    <TableCell>{room.type}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={room.status === 'available' ? 'default' : 'secondary'}>
                                                            {room.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No rooms found
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {/* Search Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <h4 className="font-medium">Reservation Search:</h4>
                            <p className="text-sm text-muted-foreground">
                                Use reservation ID (e.g., "res-001") or client name
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">Client Search:</h4>
                            <p className="text-sm text-muted-foreground">
                                Search by name, email, or phone number
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">Room Search:</h4>
                            <p className="text-sm text-muted-foreground">
                                Use room number (e.g., "101") or hotel name
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">General Tips:</h4>
                            <p className="text-sm text-muted-foreground">
                                Search is case-insensitive and supports partial matches
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
