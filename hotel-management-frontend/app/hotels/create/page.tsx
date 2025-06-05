"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function CreateHotelPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

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

    const hotelData = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
      amenities,
    }

    try {
      await apiClient(API_ROUTES.HOTELS.ADMIN.CREATE, {
        method: "POST",
        body: JSON.stringify(hotelData),
        requireAuth: true,
      })

      toast({
        title: "Hotel created",
        description: "The hotel has been created successfully.",
      })

      router.push("/hotels")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create hotel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="EMPLOYEE">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Hotel</h1>
          <p className="text-muted-foreground">Add a new hotel to the system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
              <CardDescription>Enter the details for the new hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="wifi" name="wifi" />
                    <Label htmlFor="wifi">WiFi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pool" name="pool" />
                    <Label htmlFor="pool">Pool</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gym" name="gym" />
                    <Label htmlFor="gym">Gym</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="spa" name="spa" />
                    <Label htmlFor="spa">Spa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="restaurant" name="restaurant" />
                    <Label htmlFor="restaurant">Restaurant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bar" name="bar" />
                    <Label htmlFor="bar">Bar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="parking" name="parking" />
                    <Label htmlFor="parking">Parking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="air_conditioning" name="air_conditioning" />
                    <Label htmlFor="air_conditioning">Air Conditioning</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/hotels">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Hotel"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  )
}
