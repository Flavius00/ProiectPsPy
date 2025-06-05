"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import ProtectedRoute from "@/components/protected-route"
import { format, parseISO, isValid } from "date-fns"
import { Calendar, Hotel } from "lucide-react"

// Helper function to safely format dates
const formatDisplayDate = (dateString: string) => {
  try {
    // Try parsing with parseISO first (for ISO date strings)
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return format(parsedDate, "MMM d, yyyy");
    }

    // If that fails, try regular Date constructor
    const regularDate = new Date(dateString);
    if (isValid(regularDate)) {
      return format(regularDate, "MMM d, yyyy");
    }

    // If all else fails, return the raw string
    return dateString;
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
}

interface Reservation {
  id: string
  room: {
    id: string
    room_number: string
    room_type: string
    hotel: {
      name: string
      location: string
    }
  }
  check_in_date: string
  check_out_date: string
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  client_name?: string
  client_email?: string
}

interface ReservationsResponse {
  reservations: Reservation[]
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Ensure we have auth before fetching
    const hasAuth = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!hasAuth) {
      console.warn("No authentication token found, but attempting to fetch reservations anyway");
    } else {
      console.log("Authentication token found, proceeding with reservation fetch");
    }

    fetchReservations()
  }, [mounted])

  const fetchReservations = async () => {
    setIsLoading(true)
    try {
      const endpoint = API_ROUTES.RESERVATIONS.CLIENT.LIST
      const data = await apiClient<ReservationsResponse | any>(endpoint, { requireAuth: true })

      console.log("Raw reservation data:", data);

      // Handle different response structures - backend might return just an array or an object with a reservations/items key
      // The backend endpoint for /my reservations likely returns the data directly as an array
      const reservationsList = Array.isArray(data) ? data :
        data.reservations ? data.reservations :
          data.items ? data.items : [];

      console.log("Extracted reservations list:", reservationsList);

      // Process dates and ensure proper status values
      const processedReservations = reservationsList.map((reservation: any) => {
        // Ensure dates are properly formatted strings
        const checkInDate = reservation.check_in_date instanceof Date
          ? format(reservation.check_in_date, 'yyyy-MM-dd')
          : reservation.check_in_date;

        const checkOutDate = reservation.check_out_date instanceof Date
          ? format(reservation.check_out_date, 'yyyy-MM-dd')
          : reservation.check_out_date;

        // Normalize status value to one of the expected enum values
        let status = reservation.status?.toLowerCase();
        if (!['confirmed', 'cancelled', 'completed', 'pending'].includes(status)) {
          status = 'confirmed'; // Default status
        }

        // Backend might return a nested room object or flattened properties
        // Handle both cases by checking for nested objects first, then falling back to flattened properties
        const room = reservation.room || {
          id: reservation.room_id || "",
          room_number: reservation.room_number || "N/A",
          room_type: reservation.room_type || "Standard Room",
          hotel: {
            name: reservation.hotel_name || reservation.hotel?.name || "Hotel",
            location: reservation.hotel_location || reservation.hotel?.location || reservation.location || "Unknown Location"
          }
        };

        // Handle potential data structures where hotel might be a separate property or nested inside room
        const hotel = room.hotel || reservation.hotel || {
          name: reservation.hotel_name || "Hotel",
          location: reservation.hotel_location || reservation.location || "Unknown Location"
        };

        // Create a normalized reservation object that matches our expected interface
        return {
          id: reservation.id || reservation._id || "",
          room: {
            id: room.id || "",
            room_number: room.room_number || "N/A",
            room_type: room.room_type || "Standard Room",
            hotel: {
              name: hotel.name || "Hotel",
              location: hotel.location || "Unknown Location"
            }
          },
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          total_price: reservation.total_price || reservation.price || 0,
          status: status,
          notes: reservation.notes || "",
          client_name: reservation.client_name || "",
          client_email: reservation.client_email || "",
        };
      });

      console.log("Processed reservations:", processedReservations);
      setReservations(processedReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      // Log additional details for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch reservations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const endpoint = API_ROUTES.RESERVATIONS.CLIENT.CANCEL(reservationId)
      await apiClient(endpoint, {
        method: "DELETE", // Changed from POST to DELETE based on API spec
        requireAuth: true,
      })

      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been cancelled successfully.",
      })

      // Refresh reservations
      fetchReservations()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground">View and manage your hotel reservations</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No reservations found</p>
              <p className="text-muted-foreground mb-4">You haven't made any reservations yet.</p>
              <Button onClick={() => (window.location.href = "/hotels")}>Browse Hotels</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Hotel className="h-4 w-4 mr-2" />
                        {reservation.room.hotel.name}
                      </CardTitle>
                      <CardDescription>{reservation.room.hotel.location}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusBadgeColor(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>              <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{reservation.room.room_type}</p>
                    <p className="text-sm text-muted-foreground">Room {reservation.room.room_number}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p>{formatDisplayDate(reservation.check_in_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p>{formatDisplayDate(reservation.check_out_date)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total</p>
                      <p>${(reservation.total_price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  {reservation.status === "confirmed" && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
