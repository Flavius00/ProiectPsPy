"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Edit, MapPin, Bed, Users, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import { hasRole } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface Hotel {
  id: string
  name: string
  location: string
  description: string
  address: string
  amenities: Record<string, boolean>
  created_at: string
  updated_at: string
}

interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  price: number
  position: string
  facilities: Record<string, boolean>
  is_available: boolean
  images: RoomImage[]
  created_at: string
  updated_at: string
}

interface RoomImage {
  id: string
  room_id: string
  image_url: string
  alt_text: string
  display_order: number
}

interface Review {
  id: string
  room_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  room_number?: string
  room_type?: string
}

interface RoomsResponse {
  rooms: Room[]
}

interface ReviewsResponse {
  reviews: Review[]
  average_rating: number
  total_reviews: number
}

export default function HotelDetailPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const [isAdmin, setIsAdmin] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Check if user is logged in and has admin/manager role
    setIsAdmin(hasRole("EMPLOYEE"))
    fetchHotelDetails()
  }, [hotelId])

  const fetchHotelDetails = async () => {
    setIsLoading(true)
    try {
      // Fetch hotel details
      const hotelEndpoint = API_ROUTES.HOTELS.CLIENT.DETAIL(hotelId)
      const hotelData = await apiClient<Hotel>(hotelEndpoint)
      setHotel(hotelData)

      // Fetch hotel rooms
      const roomsEndpoint = API_ROUTES.ROOMS.CLIENT.HOTEL_ROOMS(hotelId)
      const roomsData = await apiClient<Room[]>(roomsEndpoint)

      // Fetch images for each room
      const roomsWithImages = await Promise.all(
        (roomsData || []).map(async (room) => {
          try {
            const imagesEndpoint = API_ROUTES.ROOMS.ADMIN.IMAGES.LIST(room.id)
            const images = await apiClient<RoomImage[]>(imagesEndpoint)
            return { ...room, images: images || [] }
          } catch (error) {
            console.error(`Failed to fetch images for room ${room.id}:`, error)
            return { ...room, images: [] }
          }
        })
      )

      setRooms(roomsWithImages)

      // Fetch reviews for all rooms
      const allReviews: Review[] = []
      const roomMap = new Map(roomsWithImages.map(room => [room.id, room]))

      for (const room of roomsWithImages) {
        try {
          const reviewsEndpoint = API_ROUTES.REVIEWS.CLIENT.ROOM_REVIEWS(room.id)
          const reviewsData = await apiClient<Review[]>(reviewsEndpoint)
          // API returns array directly, not wrapped in ReviewsResponse
          // Add room info to each review for display
          const reviewsWithRoomInfo = (reviewsData || []).map(review => ({
            ...review,
            room_number: room.room_number,
            room_type: room.room_type
          }))
          allReviews.push(...reviewsWithRoomInfo)
        } catch (error) {
          console.error(`Failed to fetch reviews for room ${room.id}:`, error)
        }
      }
      setReviews(allReviews)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch hotel details. Please try again.",
        variant: "destructive",
      })
      router.push("/hotels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookRoom = (roomId: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(`/reservations/create?roomId=${roomId}`)}`)
      return
    }

    // Redirect to reservation creation page
    router.push(`/reservations/create?roomId=${roomId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Hotel not found.</p>
        <Link href="/hotels">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
          </Button>
        </Link>
      </div>
    )
  }

  // Convert amenities object to array for display
  const amenitiesList = Object.entries(hotel.amenities || {})
    .filter(([_, value]) => value)
    .map(([key]) => key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0
  const totalReviews = reviews.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/hotels">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{hotel.name}</h1>
          {totalReviews > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
              {averageRating.toFixed(1)} ({totalReviews} reviews)
            </Badge>
          )}
        </div>
        {isAdmin && (
          <Link href={`/hotels/${hotel.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Hotel
            </Button>
          </Link>
        )}
      </div>

      <div className="relative h-64 sm:h-96 rounded-lg overflow-hidden">
        <Image
          src={`/placeholder.svg?height=400&width=800&query=${encodeURIComponent(hotel.name)}`}
          alt={hotel.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex items-center text-muted-foreground">
        <MapPin className="h-4 w-4 mr-1" />
        {hotel.address}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{hotel.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {amenitiesList.length > 0 ? (
                  amenitiesList.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="justify-center py-1.5">
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground">No amenities listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No rooms available for this hotel.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <Card key={room.id}>
                  <div className="relative h-48">
                    {room.images && room.images.length > 0 ? (
                      <Image
                        src={room.images[0].image_url || "/placeholder.svg"}
                        alt={room.images[0].alt_text || room.room_type}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={`/placeholder.svg?height=200&width=300&query=${encodeURIComponent(room.room_type)} room`}
                        alt={room.room_type}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{room.room_type}</CardTitle>
                    <CardDescription>${room.price} per night</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{room.position}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{room.facilities?.capacity || 2} guests</span>
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{room.facilities?.beds || 1} bed</span>
                      </div>
                    </div>
                    <Button className="w-full" disabled={!room.is_available} onClick={() => handleBookRoom(room.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {room.is_available ? "Book Now" : "Not Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {totalReviews > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 fill-yellow-500 stroke-yellow-500" />
                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-2">out of 5</span>
                  </div>
                  <div className="text-muted-foreground">
                    Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Guest Reviews</CardTitle>
              <CardDescription>See what our guests have to say</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Guest {review.user_id.slice(-8)}</p>
                        {review.room_number && review.room_type && (
                          <p className="text-sm text-blue-600">
                            Room {review.room_number} ({review.room_type})
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center"
                      >
                        <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                        {review.rating.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="mt-2">{review.comment}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
