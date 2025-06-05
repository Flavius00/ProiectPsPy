"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    BarChart3,
    TrendingUp,
    Calendar,
    DollarSign,
    Users,
    Hotel,
    Download,
    Filter
} from "lucide-react"

// Mock data - in real app this would come from your API
const mockReportData = {
    overview: {
        totalReservations: 156,
        totalRevenue: 47800,
        averageStayLength: 3.2,
        occupancyRate: 78.5
    },
    monthlyStats: [
        { month: "Nov 2024", reservations: 45, revenue: 14200, occupancy: 72 },
        { month: "Oct 2024", reservations: 52, revenue: 16800, occupancy: 81 },
        { month: "Sep 2024", reservations: 38, revenue: 11600, occupancy: 69 },
        { month: "Aug 2024", reservations: 21, revenue: 5200, occupancy: 45 }
    ],
    topHotels: [
        { name: "Grand Hotel", reservations: 45, revenue: 18500 },
        { name: "City Center Hotel", reservations: 38, revenue: 15200 },
        { name: "Beach Resort", reservations: 32, revenue: 14100 },
        { name: "Mountain Lodge", reservations: 28, revenue: 8900 }
    ],
    recentActivity: [
        { action: "Reservation Confirmed", details: "res-123 for Grand Hotel", time: "2 hours ago" },
        { action: "New Client Registered", details: "alice@example.com", time: "4 hours ago" },
        { action: "Reservation Cancelled", details: "res-098 for Beach Resort", time: "6 hours ago" },
        { action: "Payment Received", details: "$480 for res-087", time: "8 hours ago" }
    ]
}

export default function EmployeeReportsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState("last30days")
    const [selectedHotel, setSelectedHotel] = useState("all")

    const generateReport = () => {
        console.log(`Generating report for period: ${selectedPeriod}, hotel: ${selectedHotel}`)
        // TODO: Implement actual report generation
    }

    const exportReport = (format: string) => {
        console.log(`Exporting report as ${format}`)
        // TODO: Implement actual export functionality
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">View reservation statistics and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportReport('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('excel')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Report Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium">Time Period</label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                                    <SelectItem value="lastyear">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium">Hotel</label>
                            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Hotels</SelectItem>
                                    <SelectItem value="grand">Grand Hotel</SelectItem>
                                    <SelectItem value="city">City Center Hotel</SelectItem>
                                    <SelectItem value="beach">Beach Resort</SelectItem>
                                    <SelectItem value="mountain">Mountain Lodge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={generateReport}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
                                <p className="text-2xl font-bold">{mockReportData.overview.totalReservations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">${mockReportData.overview.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Avg Stay Length</p>
                                <p className="text-2xl font-bold">{mockReportData.overview.averageStayLength} days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Hotel className="h-4 w-4 text-orange-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                                <p className="text-2xl font-bold">{mockReportData.overview.occupancyRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Performance</CardTitle>
                        <CardDescription>Reservation and revenue trends over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Reservations</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Occupancy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReportData.monthlyStats.map((stat, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{stat.month}</TableCell>
                                        <TableCell>{stat.reservations}</TableCell>
                                        <TableCell>${stat.revenue.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={stat.occupancy >= 75 ? "default" : "secondary"}>
                                                {stat.occupancy}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Performing Hotels */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Hotels</CardTitle>
                        <CardDescription>Hotels ranked by revenue and reservations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hotel</TableHead>
                                    <TableHead>Reservations</TableHead>
                                    <TableHead>Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReportData.topHotels.map((hotel, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                                                    {index + 1}
                                                </Badge>
                                                <span className="font-medium">{hotel.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{hotel.reservations}</TableCell>
                                        <TableCell className="font-medium">${hotel.revenue.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockReportData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div>
                                    <div className="font-medium">{activity.action}</div>
                                    <div className="text-sm text-muted-foreground">{activity.details}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Report Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Reports</CardTitle>
                    <CardDescription>Generate common reports with one click</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Daily Summary</div>
                                <div className="text-sm text-muted-foreground">Today's reservations and revenue</div>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                            <TrendingUp className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Weekly Trends</div>
                                <div className="text-sm text-muted-foreground">7-day performance analysis</div>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                            <Users className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">Client Analysis</div>
                                <div className="text-sm text-muted-foreground">Customer behavior insights</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
