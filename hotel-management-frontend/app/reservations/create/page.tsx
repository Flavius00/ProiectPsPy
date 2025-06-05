"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import ProtectedRoute from "@/components/protected-route"
import { hasRole } from "@/lib/auth"

interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  price: number
  position: string
  hotel_name?: string
  is_available: boolean
}

export default function CreateReservationPage() {
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkInDate, setCheckInDate] = useState<string>("")
  const [checkOutDate, setCheckOutDate] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [clientEmail, setClientEmail] = useState<string>("")
  const [isEmployee, setIsEmployee] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const roomId = searchParams.get("roomId")

  useEffect(() => {
    setMounted(true)
    // Set default dates to November 2025 (when rooms are available)
    const defaultCheckIn = '2025-11-01'
    const defaultCheckOut = '2025-11-02'

    setCheckInDate(defaultCheckIn)
    setCheckOutDate(defaultCheckOut)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if user is an employee
    setIsEmployee(hasRole("EMPLOYEE"))

    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required",
        variant: "destructive",
      })
      router.push("/hotels")
      return
    }

    fetchRoomDetails()
  }, [mounted, roomId, router, toast])

  useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)
      const timeDiff = checkOut.getTime() - checkIn.getTime()
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24))

      if (days > 0) {
        setTotalPrice(room.price * days)
      } else {
        setTotalPrice(0)
      }
    }
  }, [room, checkInDate, checkOutDate])

  const fetchRoomDetails = async () => {
    if (!roomId) return

    setIsLoading(true)
    try {
      const endpoint = API_ROUTES.ROOMS.CLIENT.DETAIL(roomId)
      const roomData = await apiClient<Room>(endpoint)

      // Fetch hotel name
      if (roomData.hotel_id) {
        try {
          const hotelEndpoint = API_ROUTES.HOTELS.CLIENT.DETAIL(roomData.hotel_id)
          const hotelData = await apiClient<{ name: string }>(hotelEndpoint)
          setRoom({ ...roomData, hotel_name: hotelData.name })
        } catch (hotelError) {
          // If hotel fetch fails, still set room data without hotel name
          setRoom(roomData)
        }
      } else {
        setRoom(roomData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch room details. Please try again.",
        variant: "destructive",
      })
      router.push("/hotels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!room || !checkInDate || !checkOutDate) return

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (checkOut <= checkIn) {
      toast({
        title: "Error",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get the current user from localStorage
      let userEmail = "auto@example.com"
      let userName = "Self Booking"

      if (mounted && typeof window !== 'undefined') {
        const userJson = localStorage.getItem('user')
        if (userJson) {
          try {
            const user = JSON.parse(userJson)
            userEmail = user.email || userEmail
            userName = user.username || user.name || userName
          } catch (e) {
            console.error("Failed to parse user from localStorage:", e)
          }
        }
      }

      // Format dates with times
      const checkInDateTime = `${checkInDate}T14:00:00`
      const checkOutDateTime = `${checkOutDate}T12:00:00`

      const reservationData = isEmployee
        ? {
          room_id: room.id,
          check_in_date: checkInDateTime,
          check_out_date: checkOutDateTime,
          client_email: clientEmail,
          client_name: clientEmail.split('@')[0], // Using part of email as name
        }
        : {
          room_id: room.id,
          check_in_date: checkInDateTime,
          check_out_date: checkOutDateTime,
          client_name: userName,
          client_email: userEmail,
        }

      const endpoint = isEmployee
        ? API_ROUTES.RESERVATIONS.EMPLOYEE.CREATE
        : API_ROUTES.RESERVATIONS.CLIENT.CREATE

      console.log("Creating reservation with data:", reservationData)
      console.log("Using endpoint:", endpoint)

      // Debug: Check token before making request
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || localStorage.getItem('token') : null
      console.log("Token available:", !!token)
      console.log("Token preview:", token?.substring(0, 20) + "...")

      await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify(reservationData),
        requireAuth: true,
      })

      toast({
        title: "Reservation created",
        description: "Your reservation has been created successfully.",
      })

      router.push("/reservations")
    } catch (error) {
      console.error("Reservation creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatches
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Reservation</h1>
          <p className="text-muted-foreground">Book your stay</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : room ? (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{room.room_type} - Room #{room.room_number}</CardTitle>
                <CardDescription>
                  {room.hotel_name || "Hotel"} | ${room.price.toFixed(2)} per night
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEmployee && (
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required={isEmployee}
                      placeholder="Enter client email address"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min="2025-11-01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || "2025-11-01"}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Booking availability:</strong> Reservations are available from November 2025 onwards. Please select dates from November 1, 2025 or later.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Room Price</Label>
                  <Input value={`$${room.price.toFixed(2)} per night`} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Total Price</Label>
                  <Input value={`$${totalPrice.toFixed(2)}`} disabled />
                </div>

                {totalPrice > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Check-in: {checkInDate} at 2:00 PM<br />
                      Check-out: {checkOutDate} at 12:00 PM<br />
                      Duration: {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24))} night(s)
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || totalPrice <= 0 || (isEmployee && !clientEmail)}
                >
                  {isSubmitting ? "Creating..." : "Confirm Reservation"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Room not found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/hotels")}>
              Back to Hotels
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}