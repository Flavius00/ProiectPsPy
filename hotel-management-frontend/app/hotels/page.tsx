"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { apiClient, type PaginationParams, type FilterParams } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"
import { hasRole } from "@/lib/auth"

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

interface HotelsResponse {
  hotels?: Hotel[]
  items?: Hotel[]
  total?: number
  skip?: number
  limit?: number
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [pagination, setPagination] = useState<{
    skip: number,
    limit: number
  }>({
    skip: 0,
    limit: 9,
  })
  const [totalHotels, setTotalHotels] = useState<number>(0)
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is logged in and has admin/manager role
    setIsAdmin(hasRole("EMPLOYEE"))
    fetchHotels()
  }, [location, pagination])

  const fetchHotels = async () => {
    setIsLoading(true)
    try {
      // Build filters
      const filters: FilterParams = {}
      if (location) filters.location = location

      // Use the client endpoint for public access
      const endpoint = API_ROUTES.HOTELS.CLIENT.LIST
      console.log("Fetching hotels from:", endpoint)

      const data = await apiClient<HotelsResponse | Hotel[] | any>(endpoint, {}, pagination, filters)
      console.log("Hotels response:", data)

      // Handle different possible response formats from the backend
      if (Array.isArray(data)) {
        // Direct array of hotels
        setHotels(data)
        setTotalHotels(data.length)
      } else if (data.hotels && Array.isArray(data.hotels)) {
        // Object with hotels array and pagination info
        setHotels(data.hotels)
        setTotalHotels(data.total || data.hotels.length)
      } else if (data.items && Array.isArray(data.items)) {
        // FastAPI standard pagination response format
        setHotels(data.items)
        setTotalHotels(data.total || data.items.length)
      } else if (data && typeof data === 'object' && data.id) {
        // Single hotel object response
        setHotels([data as Hotel])
        setTotalHotels(1)
      } else {
        setHotels([])
        setTotalHotels(0)
        console.error("Unexpected hotels response format:", data)
      }
    } catch (error) {
      console.error("Error fetching hotels:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch hotels. Please try again.",
        variant: "destructive",
      })
      setHotels([])
      setTotalHotels(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocation(searchQuery)
    // Reset pagination when searching
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

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate average rating (would come from the API in a real implementation)
  const getAverageRating = () => {
    return 4.5 // Placeholder
  }

  // Calculate pagination info
  const currentPage = Math.floor(pagination.skip / (pagination.limit || 1)) + 1
  const totalPages = Math.ceil(totalHotels / (pagination.limit || 1))
  const showingFrom = pagination.skip + 1
  const showingTo = Math.min(pagination.skip + (pagination.limit || 0), totalHotels)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hotels</h1>
          <p className="text-muted-foreground">Browse our collection of hotels</p>
        </div>
        {isAdmin && (
          <Link href="/hotels/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md mx-auto md:mx-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hotels by location..."
          className="pl-8 pr-20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" size="sm" className="absolute right-1 top-1">
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hotels found matching your search.</p>
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={`/placeholder.svg?height=200&width=400&query=${encodeURIComponent(hotel.name)}`}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{hotel.name}</CardTitle>
                    <CardDescription>{hotel.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center"
                      >
                        <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                        {getAverageRating().toFixed(1)}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/hotels/${hotel.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {/* Pagination controls */}
          {totalHotels > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {showingFrom} to {showingTo} of {totalHotels} hotels
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={pagination.skip === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.skip + (pagination.limit || 0) >= totalHotels}
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
