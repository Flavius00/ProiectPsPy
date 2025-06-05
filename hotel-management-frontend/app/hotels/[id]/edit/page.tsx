"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import ProtectedRoute from "@/components/protected-route"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

export default function EditHotelPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const hotelId = params.id as string

  useEffect(() => {
    fetchHotel()
  }, [hotelId])

  const fetchHotel = async () => {
    setIsLoading(true)
    try {
      const endpoint = API_ROUTES.HOTELS.ADMIN.DETAIL(hotelId)
      const data = await apiClient<Hotel>(endpoint, { requireAuth: true })
      setHotel(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch hotel. Please try again.",
        variant: "destructive",
      })
      router.push("/hotels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hotel) return

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)

      // Extract amenities
      const amenities: Record<string, boolean> = {
        wifi: formData.get("wifi") === "on",
        pool: formData.get("pool") === "on",
        gym: formData.get("gym") === "on",
        spa: formData.get("spa") === "on",
        restaurant: formData.get("restaurant") === "on",
        bar: formData.get("bar") === "on",
        parking: formData.get("parking") === "on",
        air_conditioning: formData.get("air_conditioning") === "on",
      }

      const updatedHotel = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        address: formData.get("address") as string,
        description: formData.get("description") as string,
        amenities,
      }

      const endpoint = API_ROUTES.HOTELS.ADMIN.UPDATE(hotelId)
      await apiClient(endpoint, {
        method: "PUT",
        body: JSON.stringify(updatedHotel),
        requireAuth: true,
      })

      toast({
        title: "Hotel updated",
        description: "The hotel has been updated successfully.",
      })

      router.push(`/hotels/${hotelId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update hotel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const endpoint = API_ROUTES.HOTELS.ADMIN.DELETE(hotelId)
      await apiClient(endpoint, {
        method: "DELETE",
        requireAuth: true,
      })

      toast({
        title: "Hotel deleted",
        description: "The hotel has been deleted successfully.",
      })

      router.push("/hotels")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete hotel. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute requiredRole="EMPLOYEE">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Hotel</h1>
          <p className="text-muted-foreground">Update hotel information</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hotel ? (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Hotel Information</CardTitle>
                <CardDescription>Edit the details for {hotel.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hotel Name</Label>
                  <Input id="name" name="name" defaultValue={hotel.name} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" defaultValue={hotel.location} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={hotel.address} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={4} defaultValue={hotel.description} required />
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wifi" name="wifi" defaultChecked={hotel.amenities?.wifi} />
                      <Label htmlFor="wifi">WiFi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pool" name="pool" defaultChecked={hotel.amenities?.pool} />
                      <Label htmlFor="pool">Pool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="gym" name="gym" defaultChecked={hotel.amenities?.gym} />
                      <Label htmlFor="gym">Gym</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="spa" name="spa" defaultChecked={hotel.amenities?.spa} />
                      <Label htmlFor="spa">Spa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="restaurant" name="restaurant" defaultChecked={hotel.amenities?.restaurant} />
                      <Label htmlFor="restaurant">Restaurant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bar" name="bar" defaultChecked={hotel.amenities?.bar} />
                      <Label htmlFor="bar">Bar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="parking" name="parking" defaultChecked={hotel.amenities?.parking} />
                      <Label htmlFor="parking">Parking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="air_conditioning"
                        name="air_conditioning"
                        defaultChecked={hotel.amenities?.air_conditioning}
                      />
                      <Label htmlFor="air_conditioning">Air Conditioning</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Link href={`/hotels/${hotelId}`}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Hotel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the hotel and all associated rooms,
                          reservations, and reviews.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Hotel not found.</p>
            <Link href="/hotels">
              <Button variant="outline" className="mt-4">
                Back to Hotels
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
