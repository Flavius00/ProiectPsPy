"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building, Hotel, Calendar, User } from "lucide-react"

export default function ClientDashboard() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome to Hotel Chain</h1>
                <p className="text-muted-foreground">Book your perfect stay</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Browse Hotels
                        </CardTitle>
                        <CardDescription>Explore our hotel locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/hotels">
                            <Button className="w-full">View Hotels</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hotel className="h-5 w-5" />
                            View Rooms
                        </CardTitle>
                        <CardDescription>Check available rooms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/rooms">
                            <Button className="w-full">Browse Rooms</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            My Reservations
                        </CardTitle>
                        <CardDescription>View and manage your bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/reservations">
                            <Button className="w-full">My Reservations</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
