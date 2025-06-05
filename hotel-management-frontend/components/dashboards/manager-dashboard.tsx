"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import {
    Building,
    Users,
    BarChart3,
    Calendar,
    UserCheck,
    Settings,
    FileText,
    TrendingUp,
    Loader2,
    Edit
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"

// Hotel interface based on backend DTOs
interface HotelResponse {
    id: string
    name: string
    location: string
    address: string
    description?: string
    amenities?: Record<string, boolean>
    created_at: string
    updated_at: string
}

// Hotel update request interface
interface HotelUpdateRequest {
    name?: string
    location?: string
    address?: string
    description?: string
    amenities?: Record<string, boolean>
}

// Room interfaces based on backend DTOs
interface RoomResponse {
    id: string
    hotel_id: string
    room_number: string
    room_type: string
    price: number
    position?: string
    facilities?: Record<string, boolean>
    is_available: boolean
    created_at: string
    updated_at: string
}

// Room create request interface
interface RoomCreateRequest {
    hotel_id: string
    room_number: string
    room_type: string
    price: number
    position?: string
    facilities?: Record<string, boolean>
    is_available: boolean
}

// Room update request interface
interface RoomUpdateRequest {
    hotel_id?: string
    room_number?: string
    room_type?: string
    price?: number
    position?: string
    facilities?: Record<string, boolean>
    is_available?: boolean
}

// Review interfaces based on backend DTOs
interface ReviewResponse {
    id: string
    room_id: string
    user_id: string
    rating: number
    comment: string
    created_at: string
    updated_at: string
}

// Review update request interface
interface ReviewUpdateRequest {
    rating: number
    comment: string
}

export default function ManagerDashboard() {
    const [isLoading, setIsLoading] = useState(false)
    const [hotels, setHotels] = useState<HotelResponse[]>([])

    // Room management state
    const [rooms, setRooms] = useState<RoomResponse[]>([])

    // Update hotel related state
    const [selectedHotel, setSelectedHotel] = useState<string>("")
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
    const [hotelSearchTerm, setHotelSearchTerm] = useState("")

    // Create room related state
    const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)
    const [isLoadingRoomCreate, setIsLoadingRoomCreate] = useState(false)
    const [createRoomHotelSearchTerm, setCreateRoomHotelSearchTerm] = useState("")
    const [selectedCreateRoomHotel, setSelectedCreateRoomHotel] = useState<string>("")

    // Room create form state
    const [createRoomForm, setCreateRoomForm] = useState({
        hotel_id: "",
        room_number: "",
        room_type: "",
        price: 0,
        position: "",
        facilities: {
            wifi: false,
            air_conditioning: false,
            mini_bar: false,
            balcony: false,
            king_bed: false,
            queen_bed: false,
            twin_beds: false,
            bathroom: false,
            shower: false,
            tv: false,
        },
        is_available: true
    })

    // Update room related state
    const [selectedRoom, setSelectedRoom] = useState<string>("")
    const [isUpdateRoomDialogOpen, setIsUpdateRoomDialogOpen] = useState(false)
    const [isLoadingRoomUpdate, setIsLoadingRoomUpdate] = useState(false)
    const [roomSearchTerm, setRoomSearchTerm] = useState("")

    // Hotel update form state
    const [updateForm, setUpdateForm] = useState({
        name: "",
        location: "",
        address: "",
        description: "",
        amenities: {
            wifi: false,
            pool: false,
            gym: false,
            spa: false,
            restaurant: false,
            bar: false,
            parking: false,
            air_conditioning: false,
        }
    })

    // Room update form state
    const [roomUpdateForm, setRoomUpdateForm] = useState({
        hotel_id: "",
        room_number: "",
        room_type: "",
        price: 0,
        position: "",
        facilities: {
            wifi: false,
            air_conditioning: false,
            mini_bar: false,
            balcony: false,
            king_bed: false,
            queen_bed: false,
            twin_beds: false,
            bathroom: false,
            shower: false,
            tv: false,
        },
        is_available: true
    })

    // Review management state
    const [reviews, setReviews] = useState<ReviewResponse[]>([])
    const [selectedReview, setSelectedReview] = useState<string>("")
    const [isUpdateReviewDialogOpen, setIsUpdateReviewDialogOpen] = useState(false)
    const [isLoadingReviewUpdate, setIsLoadingReviewUpdate] = useState(false)
    const [reviewSearchTerm, setReviewSearchTerm] = useState("")
    const [selectedUserId, setSelectedUserId] = useState<string>("")
    const [userSearchTerm, setUserSearchTerm] = useState("")

    // Review update form state
    const [reviewUpdateForm, setReviewUpdateForm] = useState({
        rating: 1,
        comment: ""
    })

    const { toast } = useToast()

    const handleDisplayHotels = async () => {
        setIsLoading(true)
        try {
            // Using the admin endpoint since managers have access to it
            const endpoint = API_ROUTES.HOTELS.ADMIN.LIST
            const response = await apiClient<HotelResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle different possible response formats
            const hotelsList = Array.isArray(response) ? response : []

            setHotels(hotelsList)
            toast({
                title: "Success",
                description: `Retrieved ${hotelsList.length} hotels`,
            })

            console.log("Retrieved hotels:", response)

        } catch (error) {
            console.error("Error fetching hotels:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch hotels",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearHotels = () => {
        setHotels([])
        toast({
            title: "Cleared",
            description: "Hotels view has been cleared",
        })
    }

    const handleOpenUpdateDialog = () => {
        setIsUpdateDialogOpen(true)
        // If no hotels are loaded, get all hotels first
        if (hotels.length === 0) {
            handleDisplayHotels()
        }
    }

    const handleSelectHotel = (hotelId: string) => {
        setSelectedHotel(hotelId)
        const hotel = hotels.find(h => h.id === hotelId)
        if (hotel) {
            // Pre-populate the form with current hotel data
            setUpdateForm({
                name: hotel.name,
                location: hotel.location,
                address: hotel.address,
                description: hotel.description || "",
                amenities: {
                    wifi: hotel.amenities?.wifi || false,
                    pool: hotel.amenities?.pool || false,
                    gym: hotel.amenities?.gym || false,
                    spa: hotel.amenities?.spa || false,
                    restaurant: hotel.amenities?.restaurant || false,
                    bar: hotel.amenities?.bar || false,
                    parking: hotel.amenities?.parking || false,
                    air_conditioning: hotel.amenities?.air_conditioning || false,
                }
            })
        }
    }

    const handleUpdateHotel = async () => {
        if (!selectedHotel) {
            toast({
                title: "Error",
                description: "Please select a hotel first",
                variant: "destructive",
            })
            return
        }

        if (!updateForm.name.trim() || !updateForm.location.trim() || !updateForm.address.trim()) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (name, location, address)",
                variant: "destructive",
            })
            return
        }

        setIsLoadingUpdate(true)
        try {
            // Create the update request payload
            const updateRequest: HotelUpdateRequest = {
                name: updateForm.name.trim(),
                location: updateForm.location.trim(),
                address: updateForm.address.trim(),
                description: updateForm.description.trim() || undefined,
                amenities: updateForm.amenities
            }

            // Use the hotel update endpoint
            const endpoint = API_ROUTES.HOTELS.ADMIN.UPDATE(selectedHotel)

            const response = await apiClient<HotelResponse>(endpoint, {
                method: "PUT",
                requireAuth: true,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateRequest)
            })

            // Update the hotel in the current list if it exists
            setHotels(prev => prev.map(hotel =>
                hotel.id === selectedHotel
                    ? { ...hotel, ...response }
                    : hotel
            ))

            const hotel = hotels.find(h => h.id === selectedHotel)
            const hotelInfo = hotel ? hotel.name : selectedHotel

            toast({
                title: "Success",
                description: `Successfully updated hotel "${hotelInfo}"`,
            })

            // Reset dialog state
            setIsUpdateDialogOpen(false)
            setSelectedHotel("")
            setHotelSearchTerm("")
            setUpdateForm({
                name: "",
                location: "",
                address: "",
                description: "",
                amenities: {
                    wifi: false,
                    pool: false,
                    gym: false,
                    spa: false,
                    restaurant: false,
                    bar: false,
                    parking: false,
                    air_conditioning: false,
                }
            })

        } catch (error) {
            console.error("Error updating hotel:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update hotel",
                variant: "destructive",
            })
        } finally {
            setIsLoadingUpdate(false)
        }
    }

    const handleDisplayRooms = async () => {
        setIsLoading(true)
        try {
            // Using the admin endpoint since managers have access to it
            const endpoint = API_ROUTES.ROOMS.ADMIN.LIST
            const response = await apiClient<RoomResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle different possible response formats
            const roomsList = Array.isArray(response) ? response : []

            setRooms(roomsList)
            toast({
                title: "Success",
                description: `Retrieved ${roomsList.length} rooms`,
            })

            console.log("Retrieved rooms:", response)

        } catch (error) {
            console.error("Error fetching rooms:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch rooms",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearRooms = () => {
        setRooms([])
        toast({
            title: "Cleared",
            description: "Rooms view has been cleared",
        })
    }

    const handleOpenUpdateRoomDialog = () => {
        setIsUpdateRoomDialogOpen(true)
        // If no rooms are loaded, get all rooms first
        if (rooms.length === 0) {
            handleDisplayRooms()
        }
    }

    const handleSelectRoom = (roomId: string) => {
        setSelectedRoom(roomId)
        const room = rooms.find(r => r.id === roomId)
        if (room) {
            // Pre-populate the form with current room data
            setRoomUpdateForm({
                hotel_id: room.hotel_id,
                room_number: room.room_number,
                room_type: room.room_type,
                price: room.price,
                position: room.position || "",
                facilities: {
                    wifi: room.facilities?.wifi || false,
                    air_conditioning: room.facilities?.air_conditioning || false,
                    mini_bar: room.facilities?.mini_bar || false,
                    balcony: room.facilities?.balcony || false,
                    king_bed: room.facilities?.king_bed || false,
                    queen_bed: room.facilities?.queen_bed || false,
                    twin_beds: room.facilities?.twin_beds || false,
                    bathroom: room.facilities?.bathroom || false,
                    shower: room.facilities?.shower || false,
                    tv: room.facilities?.tv || false,
                },
                is_available: room.is_available
            })
        }
    }

    const handleRoomFacilityChange = (facility: string, checked: boolean) => {
        setRoomUpdateForm(prev => ({
            ...prev,
            facilities: {
                ...prev.facilities,
                [facility]: checked
            }
        }))
    }

    const handleUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoom) {
            toast({
                title: "Error",
                description: "Please select a room to update",
                variant: "destructive",
            })
            return
        }

        // Basic validation
        if (!roomUpdateForm.room_number.trim() || !roomUpdateForm.room_type.trim() || roomUpdateForm.price <= 0) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (room number, room type, and price must be valid)",
                variant: "destructive",
            })
            return
        }

        setIsLoadingRoomUpdate(true)
        try {
            const endpoint = API_ROUTES.ROOMS.ADMIN.UPDATE(selectedRoom)

            // Prepare the update data according to RoomUpdateRequest DTO
            const updateData: RoomUpdateRequest = {
                hotel_id: roomUpdateForm.hotel_id || undefined,
                room_number: roomUpdateForm.room_number || undefined,
                room_type: roomUpdateForm.room_type || undefined,
                price: roomUpdateForm.price > 0 ? roomUpdateForm.price : undefined,
                position: roomUpdateForm.position || undefined,
                facilities: roomUpdateForm.facilities,
                is_available: roomUpdateForm.is_available
            }

            const response = await apiClient<RoomResponse>(endpoint, {
                method: "PUT",
                body: JSON.stringify(updateData),
                requireAuth: true,
            })

            console.log("Room update response:", response)

            // Update the room in the current list if it exists
            setRooms(prev => prev.map(room =>
                room.id === selectedRoom
                    ? { ...room, ...response }
                    : room
            ))

            const room = rooms.find(r => r.id === selectedRoom)
            const roomInfo = room ? `Room ${room.room_number}` : selectedRoom

            toast({
                title: "Success",
                description: `Successfully updated ${roomInfo}`,
            })

            // Reset dialog state
            setIsUpdateRoomDialogOpen(false)
            setSelectedRoom("")
            setRoomSearchTerm("")
            setRoomUpdateForm({
                hotel_id: "",
                room_number: "",
                room_type: "",
                price: 0,
                position: "",
                facilities: {
                    wifi: false,
                    air_conditioning: false,
                    mini_bar: false,
                    balcony: false,
                    king_bed: false,
                    queen_bed: false,
                    twin_beds: false,
                    bathroom: false,
                    shower: false,
                    tv: false,
                },
                is_available: true
            })

        } catch (error) {
            console.error("Error updating room:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update room",
                variant: "destructive",
            })
        } finally {
            setIsLoadingRoomUpdate(false)
        }
    }

    const handleOpenCreateRoomDialog = () => {
        setIsCreateRoomDialogOpen(true)
        // If no hotels are loaded, get all hotels first for selection
        if (hotels.length === 0) {
            handleDisplayHotels()
        }
    }

    const handleSelectCreateRoomHotel = (hotelId: string) => {
        setSelectedCreateRoomHotel(hotelId)
        setCreateRoomForm(prev => ({
            ...prev,
            hotel_id: hotelId
        }))
    }

    const handleCreateRoomFacilityChange = (facility: string, checked: boolean) => {
        setCreateRoomForm(prev => ({
            ...prev,
            facilities: {
                ...prev.facilities,
                [facility]: checked
            }
        }))
    }

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!createRoomForm.hotel_id || !createRoomForm.room_number.trim() ||
            !createRoomForm.room_type.trim() || createRoomForm.price <= 0) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (hotel, room number, room type, and price must be valid)",
                variant: "destructive",
            })
            return
        }

        setIsLoadingRoomCreate(true)
        try {
            const endpoint = API_ROUTES.ROOMS.ADMIN.CREATE

            // Prepare the create data according to RoomCreateRequest DTO
            const createData: RoomCreateRequest = {
                hotel_id: createRoomForm.hotel_id,
                room_number: createRoomForm.room_number.trim(),
                room_type: createRoomForm.room_type.trim(),
                price: createRoomForm.price,
                position: createRoomForm.position.trim() || undefined,
                facilities: createRoomForm.facilities,
                is_available: createRoomForm.is_available
            }

            const response = await apiClient<RoomResponse>(endpoint, {
                method: "POST",
                body: JSON.stringify(createData),
                requireAuth: true,
            })

            console.log("Room create response:", response)

            // Add the new room to the current list if rooms are loaded
            setRooms(prev => [...prev, response])

            const selectedHotel = hotels.find(h => h.id === createRoomForm.hotel_id)
            const hotelInfo = selectedHotel ? selectedHotel.name : "Hotel"

            toast({
                title: "Success",
                description: `Successfully created Room ${createRoomForm.room_number} in ${hotelInfo}`,
            })

            // Reset dialog state
            setIsCreateRoomDialogOpen(false)
            setSelectedCreateRoomHotel("")
            setCreateRoomHotelSearchTerm("")
            setCreateRoomForm({
                hotel_id: "",
                room_number: "",
                room_type: "",
                price: 0,
                position: "",
                facilities: {
                    wifi: false,
                    air_conditioning: false,
                    mini_bar: false,
                    balcony: false,
                    king_bed: false,
                    queen_bed: false,
                    twin_beds: false,
                    bathroom: false,
                    shower: false,
                    tv: false,
                },
                is_available: true
            })

        } catch (error) {
            console.error("Error creating room:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create room",
                variant: "destructive",
            })
        } finally {
            setIsLoadingRoomCreate(false)
        }
    }

    // Review Management Functions
    const handleDisplayUserReviews = async () => {
        if (!selectedUserId) {
            toast({
                title: "Error",
                description: "Please enter a user ID first",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            // Using the admin endpoint to get user reviews
            const endpoint = API_ROUTES.REVIEWS.ADMIN.USER_REVIEWS(selectedUserId)
            const response = await apiClient<ReviewResponse[]>(endpoint, {
                method: "GET",
                requireAuth: true,
            })

            // Handle different possible response formats
            const reviewsList = Array.isArray(response) ? response : []

            setReviews(reviewsList)
            toast({
                title: "Success",
                description: `Retrieved ${reviewsList.length} reviews for user`,
            })

            console.log("Retrieved reviews:", response)

        } catch (error) {
            console.error("Error fetching user reviews:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch user reviews",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearReviews = () => {
        setReviews([])
        setSelectedUserId("")
        toast({
            title: "Cleared",
            description: "Reviews view has been cleared",
        })
    }

    const handleOpenUpdateReviewDialog = () => {
        setIsUpdateReviewDialogOpen(true)
        // If no reviews are loaded, prompt for user ID to load reviews
        if (reviews.length === 0) {
            toast({
                title: "Info",
                description: "Enter a user ID to load reviews first",
            })
        }
    }

    const handleSelectReview = (reviewId: string) => {
        setSelectedReview(reviewId)
        const review = reviews.find(r => r.id === reviewId)
        if (review) {
            // Pre-populate the form with current review data
            setReviewUpdateForm({
                rating: review.rating,
                comment: review.comment
            })
        }
    }

    const handleUpdateReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedReview) {
            toast({
                title: "Error",
                description: "Please select a review to update",
                variant: "destructive",
            })
            return
        }

        // Basic validation
        if (reviewUpdateForm.rating < 1 || reviewUpdateForm.rating > 5) {
            toast({
                title: "Error",
                description: "Rating must be between 1 and 5",
                variant: "destructive",
            })
            return
        }

        if (!reviewUpdateForm.comment.trim()) {
            toast({
                title: "Error",
                description: "Comment cannot be empty",
                variant: "destructive",
            })
            return
        }

        setIsLoadingReviewUpdate(true)
        try {
            const endpoint = API_ROUTES.REVIEWS.ADMIN.UPDATE(selectedReview)

            // Prepare the update data according to ReviewUpdateRequest DTO
            const updateData: ReviewUpdateRequest = {
                rating: reviewUpdateForm.rating,
                comment: reviewUpdateForm.comment.trim()
            }

            const response = await apiClient<ReviewResponse>(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
                requireAuth: true,
            })

            // Update the local state
            setReviews(prev => prev.map(review =>
                review.id === selectedReview ? response : review
            ))

            // Reset form and close dialog
            setIsUpdateReviewDialogOpen(false)
            setSelectedReview("")
            setReviewUpdateForm({
                rating: 1,
                comment: ""
            })

            toast({
                title: "Success",
                description: "Review updated successfully",
            })

            console.log("Updated review:", response)

        } catch (error) {
            console.error("Error updating review:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update review",
                variant: "destructive",
            })
        } finally {
            setIsLoadingReviewUpdate(false)
        }
    }

    const filteredHotels = hotels.filter(hotel =>
        hotelSearchTerm === "" ||
        hotel.name.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
        hotel.id.toLowerCase().includes(hotelSearchTerm.toLowerCase())
    )

    const filteredRooms = rooms.filter(room =>
        roomSearchTerm === "" ||
        room.room_number.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
        room.room_type.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
        (room.position && room.position.toLowerCase().includes(roomSearchTerm.toLowerCase()))
    )

    const filteredHotelsForCreateRoom = hotels.filter(hotel =>
        createRoomHotelSearchTerm === "" ||
        hotel.name.toLowerCase().includes(createRoomHotelSearchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(createRoomHotelSearchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(createRoomHotelSearchTerm.toLowerCase()) ||
        hotel.id.toLowerCase().includes(createRoomHotelSearchTerm.toLowerCase())
    )

    const filteredReviews = reviews.filter(review =>
        reviewSearchTerm === "" ||
        review.comment.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        review.rating.toString().includes(reviewSearchTerm) ||
        review.id.toLowerCase().includes(reviewSearchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                <p className="text-muted-foreground">Oversee operations and manage your hotel</p>
            </div>

            {/* Hotel Management Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Building className="w-6 h-6" />
                    Hotel Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Display Hotels
                            </CardTitle>
                            <CardDescription>
                                View all hotels in the chain
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={handleDisplayHotels}
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "View Hotels"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Update Hotel
                            </CardTitle>
                            <CardDescription>
                                Modify hotel information and details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={handleOpenUpdateDialog}>
                                        Update Hotel
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Update Hotel
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a hotel and update its information
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* Hotel Selection */}
                                        <div className="space-y-3">
                                            <Label htmlFor="hotel-search">Select Hotel</Label>
                                            <Input
                                                id="hotel-search"
                                                placeholder="Search hotels by name, location, or ID..."
                                                value={hotelSearchTerm}
                                                onChange={(e) => setHotelSearchTerm(e.target.value)}
                                            />

                                            {filteredHotels.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredHotels.map((hotel) => (
                                                        <div
                                                            key={hotel.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedHotel === hotel.id ? 'bg-primary/10' : ''
                                                                }`}
                                                            onClick={() => handleSelectHotel(hotel.id)}
                                                        >
                                                            <div className="font-medium">{hotel.name}</div>
                                                            <div className="text-sm text-muted-foreground">{hotel.location}</div>
                                                            <div className="text-xs text-muted-foreground">{hotel.id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {hotels.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No hotels loaded. Hotels will be loaded automatically when you open this dialog.
                                                </p>
                                            )}
                                        </div>

                                        {/* Hotel Update Form */}
                                        {selectedHotel && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="hotel-name">Hotel Name *</Label>
                                                        <Input
                                                            id="hotel-name"
                                                            value={updateForm.name}
                                                            onChange={(e) => setUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="Enter hotel name"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="hotel-location">Location *</Label>
                                                        <Input
                                                            id="hotel-location"
                                                            value={updateForm.location}
                                                            onChange={(e) => setUpdateForm(prev => ({ ...prev, location: e.target.value }))}
                                                            placeholder="Enter location"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hotel-address">Address *</Label>
                                                    <Input
                                                        id="hotel-address"
                                                        value={updateForm.address}
                                                        onChange={(e) => setUpdateForm(prev => ({ ...prev, address: e.target.value }))}
                                                        placeholder="Enter full address"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hotel-description">Description</Label>
                                                    <Textarea
                                                        id="hotel-description"
                                                        value={updateForm.description}
                                                        onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                                                        placeholder="Enter hotel description"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label>Amenities</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(updateForm.amenities).map(([key, value]) => (
                                                            <div key={key} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`amenity-${key}`}
                                                                    checked={value}
                                                                    onCheckedChange={(checked) =>
                                                                        setUpdateForm(prev => ({
                                                                            ...prev,
                                                                            amenities: {
                                                                                ...prev.amenities,
                                                                                [key]: checked === true
                                                                            }
                                                                        }))
                                                                    }
                                                                />
                                                                <Label htmlFor={`amenity-${key}`} className="text-sm">
                                                                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={handleUpdateHotel}
                                                        disabled={isLoadingUpdate}
                                                        className="flex-1"
                                                    >
                                                        {isLoadingUpdate ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            'Update Hotel'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsUpdateDialogOpen(false)}
                                                        disabled={isLoadingUpdate}
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
                </div>
            </div>

            {/* Room Management Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Room Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Create Room
                            </CardTitle>
                            <CardDescription>
                                Add a new room to a specific hotel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isCreateRoomDialogOpen} onOpenChange={setIsCreateRoomDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={handleOpenCreateRoomDialog}>
                                        Create Room
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Create Room
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a hotel and create a new room
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* Hotel Selection */}
                                        <div className="space-y-3">
                                            <Label htmlFor="create-room-hotel-search">Select Hotel</Label>
                                            <Input
                                                id="create-room-hotel-search"
                                                placeholder="Search hotels by name, location, or ID..."
                                                value={createRoomHotelSearchTerm}
                                                onChange={(e) => setCreateRoomHotelSearchTerm(e.target.value)}
                                            />

                                            {filteredHotelsForCreateRoom.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredHotelsForCreateRoom.map((hotel) => (
                                                        <div
                                                            key={hotel.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedCreateRoomHotel === hotel.id ? 'bg-primary/10' : ''
                                                                }`}
                                                            onClick={() => handleSelectCreateRoomHotel(hotel.id)}
                                                        >
                                                            <div className="font-medium">{hotel.name}</div>
                                                            <div className="text-sm text-muted-foreground">{hotel.location}</div>
                                                            <div className="text-xs text-muted-foreground">{hotel.id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {hotels.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No hotels loaded. Hotels will be loaded automatically when you open this dialog.
                                                </p>
                                            )}
                                        </div>

                                        {/* Room Create Form */}
                                        {selectedCreateRoomHotel && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-room-number">Room Number *</Label>
                                                        <Input
                                                            id="create-room-number"
                                                            value={createRoomForm.room_number}
                                                            onChange={(e) => setCreateRoomForm(prev => ({ ...prev, room_number: e.target.value }))}
                                                            placeholder="Enter room number"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-room-type">Room Type *</Label>
                                                        <Input
                                                            id="create-room-type"
                                                            value={createRoomForm.room_type}
                                                            onChange={(e) => setCreateRoomForm(prev => ({ ...prev, room_type: e.target.value }))}
                                                            placeholder="Enter room type"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="create-room-price">Price *</Label>
                                                    <Input
                                                        id="create-room-price"
                                                        type="number"
                                                        value={createRoomForm.price}
                                                        onChange={(e) => setCreateRoomForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                                        placeholder="Enter room price"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="create-room-position">Position</Label>
                                                    <Input
                                                        id="create-room-position"
                                                        value={createRoomForm.position}
                                                        onChange={(e) => setCreateRoomForm(prev => ({ ...prev, position: e.target.value }))}
                                                        placeholder="Enter room position"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label>Facilities</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(createRoomForm.facilities).map(([key, value]) => (
                                                            <div key={key} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`create-facility-${key}`}
                                                                    checked={value}
                                                                    onCheckedChange={(checked) =>
                                                                        handleCreateRoomFacilityChange(key, checked === true)
                                                                    }
                                                                />
                                                                <Label htmlFor={`create-facility-${key}`} className="text-sm">
                                                                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={handleCreateRoom}
                                                        disabled={isLoadingRoomCreate}
                                                        className="flex-1"
                                                    >
                                                        {isLoadingRoomCreate ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            'Create Room'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsCreateRoomDialogOpen(false)}
                                                        disabled={isLoadingRoomCreate}
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
                                <Calendar className="w-5 h-5" />
                                Display Rooms
                            </CardTitle>
                            <CardDescription>
                                View all rooms across all hotels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full"
                                onClick={handleDisplayRooms}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                View Rooms
                            </Button>
                            {rooms.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleClearRooms}
                                >
                                    Clear Results
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Update Room
                            </CardTitle>
                            <CardDescription>
                                Modify room details and amenities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isUpdateRoomDialogOpen} onOpenChange={setIsUpdateRoomDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={handleOpenUpdateRoomDialog}>
                                        Update Room
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Update Room
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a room and update its information
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* Room Selection */}
                                        <div className="space-y-3">
                                            <Label htmlFor="room-search">Select Room</Label>
                                            <Input
                                                id="room-search"
                                                placeholder="Search rooms by number, type, or position..."
                                                value={roomSearchTerm}
                                                onChange={(e) => setRoomSearchTerm(e.target.value)}
                                            />

                                            {filteredRooms.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredRooms.map((room) => (
                                                        <div
                                                            key={room.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedRoom === room.id ? 'bg-primary/10' : ''
                                                                }`}
                                                            onClick={() => handleSelectRoom(room.id)}
                                                        >
                                                            <div className="font-medium">{room.room_number}</div>
                                                            <div className="text-sm text-muted-foreground">{room.room_type}</div>
                                                            <div className="text-xs text-muted-foreground">{room.position}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {rooms.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No rooms loaded. Rooms will be loaded automatically when you open this dialog.
                                                </p>
                                            )}
                                        </div>

                                        {/* Room Update Form */}
                                        {selectedRoom && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="room-number">Room Number *</Label>
                                                        <Input
                                                            id="room-number"
                                                            value={roomUpdateForm.room_number}
                                                            onChange={(e) => setRoomUpdateForm(prev => ({ ...prev, room_number: e.target.value }))}
                                                            placeholder="Enter room number"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="room-type">Room Type *</Label>
                                                        <Input
                                                            id="room-type"
                                                            value={roomUpdateForm.room_type}
                                                            onChange={(e) => setRoomUpdateForm(prev => ({ ...prev, room_type: e.target.value }))}
                                                            placeholder="Enter room type"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="room-price">Price *</Label>
                                                    <Input
                                                        id="room-price"
                                                        type="number"
                                                        value={roomUpdateForm.price}
                                                        onChange={(e) => setRoomUpdateForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                                        placeholder="Enter room price"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="room-position">Position</Label>
                                                    <Input
                                                        id="room-position"
                                                        value={roomUpdateForm.position}
                                                        onChange={(e) => setRoomUpdateForm(prev => ({ ...prev, position: e.target.value }))}
                                                        placeholder="Enter room position"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label>Facilities</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(roomUpdateForm.facilities).map(([key, value]) => (
                                                            <div key={key} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`facility-${key}`}
                                                                    checked={value}
                                                                    onCheckedChange={(checked) =>
                                                                        handleRoomFacilityChange(key, checked === true)
                                                                    }
                                                                />
                                                                <Label htmlFor={`facility-${key}`} className="text-sm">
                                                                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={handleUpdateRoom}
                                                        disabled={isLoadingRoomUpdate}
                                                        className="flex-1"
                                                    >
                                                        {isLoadingRoomUpdate ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            'Update Room'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsUpdateRoomDialogOpen(false)}
                                                        disabled={isLoadingRoomUpdate}
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
                </div>
            </div>

            {/* Review Management Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Review Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Display User Reviews
                            </CardTitle>
                            <CardDescription>
                                View all customer reviews and ratings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter user ID..."
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    onClick={handleDisplayUserReviews}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Loading..." : "View Reviews"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Update Review
                            </CardTitle>
                            <CardDescription>
                                Moderate and update customer reviews
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isUpdateReviewDialogOpen} onOpenChange={setIsUpdateReviewDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={handleOpenUpdateReviewDialog}>
                                        Update Review
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Update Review
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select a review and update its information
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* Review Selection */}
                                        <div className="space-y-3">
                                            <Label htmlFor="review-search">Select Review</Label>
                                            <Input
                                                id="review-search"
                                                placeholder="Search reviews by comment..."
                                                value={reviewSearchTerm}
                                                onChange={(e) => setReviewSearchTerm(e.target.value)}
                                            />

                                            {filteredReviews.length > 0 && (
                                                <div className="border rounded-md max-h-32 overflow-y-auto">
                                                    {filteredReviews.map((review) => (
                                                        <div
                                                            key={review.id}
                                                            className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedReview === review.id ? 'bg-primary/10' : ''
                                                                }`}
                                                            onClick={() => handleSelectReview(review.id)}
                                                        >
                                                            <div className="font-medium">Rating: {review.rating}</div>
                                                            <div className="text-sm text-muted-foreground">{review.comment}</div>
                                                            <div className="text-xs text-muted-foreground">{review.id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {reviews.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No reviews loaded. Enter a user ID to load reviews.
                                                </p>
                                            )}
                                        </div>

                                        {/* Review Update Form */}
                                        {selectedReview && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="review-rating">Rating *</Label>
                                                    <Input
                                                        id="review-rating"
                                                        type="number"
                                                        value={reviewUpdateForm.rating}
                                                        onChange={(e) => setReviewUpdateForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                                        placeholder="Enter rating (1-5)"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="review-comment">Comment *</Label>
                                                    <Textarea
                                                        id="review-comment"
                                                        value={reviewUpdateForm.comment}
                                                        onChange={(e) => setReviewUpdateForm(prev => ({ ...prev, comment: e.target.value }))}
                                                        placeholder="Enter review comment"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={handleUpdateReview}
                                                        disabled={isLoadingReviewUpdate}
                                                        className="flex-1"
                                                    >
                                                        {isLoadingReviewUpdate ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            'Update Review'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsUpdateReviewDialogOpen(false)}
                                                        disabled={isLoadingReviewUpdate}
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
                                <UserCheck className="w-5 h-5" />
                                Delete Review
                            </CardTitle>
                            <CardDescription>
                                Remove inappropriate or outdated reviews
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full">
                                Delete Review
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Display fetched hotels */}
            {hotels.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Hotels ({hotels.length})</CardTitle>
                                    <CardDescription>Hotels in the chain</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearHotels}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {hotels.map((hotel) => (
                                    <div
                                        key={hotel.id}
                                        className="p-4 border rounded-lg bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Name:</strong>
                                                    <p className="text-sm">{hotel.name}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Location:</strong>
                                                    <p className="text-sm">{hotel.location}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Address:</strong>
                                                    <p className="text-sm">{hotel.address}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{hotel.id}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {hotel.description && (
                                                    <div>
                                                        <strong className="text-sm font-semibold">Description:</strong>
                                                        <p className="text-sm line-clamp-2">{hotel.description}</p>
                                                    </div>
                                                )}
                                                {hotel.amenities && Object.keys(hotel.amenities).length > 0 && (
                                                    <div>
                                                        <strong className="text-sm font-semibold">Amenities:</strong>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Object.entries(hotel.amenities)
                                                                .filter(([, value]) => value)
                                                                .map(([key]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                                                    >
                                                                        {key.replace('_', ' ')}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <strong className="text-sm font-semibold">Created:</strong>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(hotel.created_at).toLocaleDateString()}
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

            {/* Display fetched rooms */}
            {rooms.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Rooms ({rooms.length})</CardTitle>
                                    <CardDescription>All rooms across hotels</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearRooms}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="p-4 border rounded-lg bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Room Number:</strong>
                                                    <p className="text-sm">{room.room_number}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Room Type:</strong>
                                                    <p className="text-sm">{room.room_type}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Price:</strong>
                                                    <p className="text-sm">${room.price}/night</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Hotel ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{room.hotel_id}</p>
                                                </div>
                                                {room.position && (
                                                    <div>
                                                        <strong className="text-sm font-semibold">Position:</strong>
                                                        <p className="text-sm">{room.position}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <strong className="text-sm font-semibold">Status:</strong>
                                                    <p className={`text-sm ${room.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                                        {room.is_available ? 'Available' : 'Occupied'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Room ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{room.id}</p>
                                                </div>
                                                {room.facilities && Object.keys(room.facilities).length > 0 && (
                                                    <div>
                                                        <strong className="text-sm font-semibold">Facilities:</strong>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Object.entries(room.facilities)
                                                                .filter(([, value]) => value)
                                                                .map(([key]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                                    >
                                                                        {key.replace('_', ' ')}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <strong className="text-sm font-semibold">Created:</strong>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(room.created_at).toLocaleDateString()}
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

            {/* Display fetched reviews */}
            {reviews.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>User Reviews ({reviews.length})</CardTitle>
                                    <CardDescription>Customer reviews and ratings</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearReviews}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-4 border rounded-lg bg-muted/50"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Rating:</strong>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm">{review.rating}/5</span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Comment:</strong>
                                                    <p className="text-sm">{review.comment}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Room ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{review.room_id}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">User ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{review.user_id}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <strong className="text-sm font-semibold">Review ID:</strong>
                                                    <p className="text-xs font-mono text-muted-foreground">{review.id}</p>
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-semibold">Created:</strong>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString()}
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
