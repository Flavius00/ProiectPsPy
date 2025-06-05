"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, ChevronLeft, ChevronRight, Bed, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { apiClient, type PaginationParams, type FilterParams } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import { hasRole } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface Room {
    id: string
    hotel_id: string
    room_number: string
    room_type: string
    price: number
    position: string | null
    facilities: Record<string, boolean> | null
    is_available: boolean
    created_at: string
    updated_at: string
    hotel?: {
        id: string
        name: string
        location: string
    }
}

interface RoomFilters {
    room_type?: string
    min_price?: number
    max_price?: number
    available_only?: boolean
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [filters, setFilters] = useState<RoomFilters>({
        available_only: true
    })
    const [pagination, setPagination] = useState<{
        skip: number,
        limit: number
    }>({
        skip: 0,
        limit: 12,
    })
    const [totalRooms, setTotalRooms] = useState<number>(0)
    const { toast } = useToast()
    const [isEmployee, setIsEmployee] = useState(false)
    const { isAuthenticated } = useAuth()

    // Available room types for filtering
    const roomTypes = ["Standard", "Deluxe", "Suite", "Ocean View", "Mountain View", "City View"]

    useEffect(() => {
        // Check if user is logged in and has employee+ role
        setIsEmployee(hasRole("EMPLOYEE"))
        fetchRooms()
    }, [filters, pagination])

    const fetchRooms = async () => {
        setIsLoading(true)
        try {
            // Build filter parameters
            const filterParams: FilterParams = {}
            if (filters.room_type) filterParams.room_type = filters.room_type
            if (filters.min_price !== undefined) filterParams.min_price = filters.min_price.toString()
            if (filters.max_price !== undefined) filterParams.max_price = filters.max_price.toString()
            if (filters.available_only !== undefined) filterParams.available_only = filters.available_only.toString()

            // Use admin endpoint for comprehensive room listing, or client search endpoint
            const endpoint = isEmployee
                ? API_ROUTES.ROOMS.ADMIN.LIST
                : API_ROUTES.ROOMS.CLIENT.SEARCH

            console.log("Fetching rooms from:", endpoint)

            const data = await apiClient<Room[] | any>(endpoint, {}, pagination, filterParams)
            console.log("Rooms response:", data)

            // Handle different possible response formats from the backend
            if (Array.isArray(data)) {
                // Direct array of rooms - backend returns List[RoomResponse]
                const roomsWithHotelInfo = await enrichRoomsWithHotelInfo(data)
                setRooms(roomsWithHotelInfo)
                setTotalRooms(data.length)
            } else {
                setRooms([])
                setTotalRooms(0)
                console.error("Unexpected rooms response format:", data)
            }
        } catch (error) {
            console.error("Error fetching rooms:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch rooms. Please try again.",
                variant: "destructive",
            })
            setRooms([])
            setTotalRooms(0)
        } finally {
            setIsLoading(false)
        }
    }

    // Enrich rooms with hotel information
    const enrichRoomsWithHotelInfo = async (rooms: Room[]): Promise<Room[]> => {
        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                try {
                    // Fetch hotel info if not already included
                    if (!room.hotel && room.hotel_id) {
                        const hotelEndpoint = API_ROUTES.HOTELS.CLIENT.DETAIL(room.hotel_id)
                        const hotelData = await apiClient<{ id: string, name: string, location: string }>(hotelEndpoint)
                        return {
                            ...room,
                            hotel: {
                                id: hotelData.id,
                                name: hotelData.name,
                                location: hotelData.location
                            }
                        }
                    }
                    return room
                } catch (error) {
                    console.error(`Failed to fetch hotel info for room ${room.id}:`, error)
                    return room
                }
            })
        )
        return enrichedRooms
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Reset pagination when searching
        setPagination((prev) => ({ ...prev, skip: 0 }))
        fetchRooms()
    }

    const handleFilterChange = (key: keyof RoomFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        // Reset pagination when filtering
        setPagination((prev) => ({ ...prev, skip: 0 }))
    }

    const clearFilters = () => {
        setFilters({ available_only: true })
        setSearchQuery("")
        setPagination((prev) => ({ ...prev, skip: 0 }))
    }

    const handleNextPage = () => {
        setPagination((prev) => ({
            ...prev,
            skip: prev.skip + prev.limit,
        }))
    }

    const handlePrevPage = () => {
        setPagination((prev) => ({
            ...prev,
            skip: Math.max(0, prev.skip - prev.limit),
        }))
    }

    const handleBookRoom = (roomId: string) => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            window.location.href = `/login?redirect=${encodeURIComponent(`/reservations/create?roomId=${roomId}`)}`
            return
        }

        // Redirect to reservation creation page
        window.location.href = `/reservations/create?roomId=${roomId}`
    }

    // Apply client-side search filter
    const filteredRooms = rooms.filter(
        (room) =>
            room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.position && room.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (room.hotel?.name && room.hotel.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (room.hotel?.location && room.hotel.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Calculate pagination info
    const currentPage = Math.floor(pagination.skip / (pagination.limit || 1)) + 1
    const totalPages = Math.ceil(totalRooms / (pagination.limit || 1))
    const showingFrom = pagination.skip + 1
    const showingTo = Math.min(pagination.skip + (pagination.limit || 0), totalRooms)

    // Helper function to get facility icons
    const getFacilityIcons = (facilities: Record<string, boolean> | null) => {
        if (!facilities) return []
        const icons = []
        if (facilities.wifi) icons.push("📶")
        if (facilities.air_conditioning) icons.push("❄️")
        if (facilities.mini_bar) icons.push("🍹")
        if (facilities.balcony) icons.push("🌅")
        if (facilities.king_bed) icons.push("🛏️")
        return icons.slice(0, 3) // Show only first 3 facilities
    }

    const getFacilityCount = (facilities: Record<string, boolean> | null) => {
        if (!facilities) return 0
        return Object.keys(facilities).length
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Rooms</h1>
                    <p className="text-muted-foreground">Browse rooms across all hotels</p>
                </div>
                {isEmployee && (
                    <Link href="/hotels">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Manage Hotels
                        </Button>
                    </Link>
                )}
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="relative max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms, hotels, or locations..."
                        className="pl-8 pr-20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="absolute right-1 top-1">
                        Search
                    </Button>
                </form>

                {/* Filter Controls */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <div>
                        <Label htmlFor="room-type">Room Type</Label>
                        <Select
                            value={filters.room_type || "all"}
                            onValueChange={(value) => handleFilterChange("room_type", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Any type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any type</SelectItem>
                                {roomTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="min-price">Min Price</Label>
                        <Input
                            id="min-price"
                            type="number"
                            placeholder="$0"
                            value={filters.min_price || ""}
                            onChange={(e) => handleFilterChange("min_price", e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="max-price">Max Price</Label>
                        <Input
                            id="max-price"
                            type="number"
                            placeholder="$999"
                            value={filters.max_price || ""}
                            onChange={(e) => handleFilterChange("max_price", e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Select
                            value={filters.available_only !== undefined ? filters.available_only.toString() : "true"}
                            onValueChange={(value) => handleFilterChange("available_only", value === "true")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Available only" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Available only</SelectItem>
                                <SelectItem value="false">All rooms</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button variant="outline" onClick={clearFilters} className="w-full">
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Room Listing */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredRooms.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">No rooms found matching your criteria.</p>
                                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            filteredRooms.map((room) => (
                                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative h-48">
                                        <Image
                                            src={`/placeholder.svg?height=200&width=300&query=${encodeURIComponent(`Room ${room.room_number}`)}`}
                                            alt={`Room ${room.room_number}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={room.is_available ? "default" : "secondary"}>
                                                {room.is_available ? "Available" : "Occupied"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Room {room.room_number}</span>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                ${room.price}/night
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Bed className="h-4 w-4" />
                                                {room.room_type}
                                            </div>
                                            {room.hotel && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {room.hotel.name}, {room.hotel.location}
                                                </div>
                                            )}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {room.position && (
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline">{room.position}</Badge>
                                            </div>
                                        )}

                                        {/* Facilities */}
                                        <div className="flex items-center gap-1">
                                            {getFacilityIcons(room.facilities).map((icon, index) => (
                                                <span key={index} className="text-sm">{icon}</span>
                                            ))}
                                            {getFacilityCount(room.facilities) > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{getFacilityCount(room.facilities) - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex gap-2">
                                        <Link href={`/hotels/${room.hotel_id}#room-${room.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        {room.is_available && (
                                            <Button
                                                onClick={() => handleBookRoom(room.id)}
                                                className="flex-1"
                                            >
                                                Book Room
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination controls */}
                    {totalRooms > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {showingFrom} to {showingTo} of {totalRooms} rooms
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={pagination.skip === 0}>
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={pagination.skip + (pagination.limit || 0) >= totalRooms}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
