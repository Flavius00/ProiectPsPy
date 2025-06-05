"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getToken, getDecodedToken, getCurrentUser } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { API_ROUTES } from "@/lib/config"

export default function AuthDebugPage() {
    const { user, isAuthenticated, loading } = useAuth()
    const [debugInfo, setDebugInfo] = useState<any>({})
    const [testResult, setTestResult] = useState<string>("")

    useEffect(() => {
        const gatherDebugInfo = async () => {
            const token = getToken()
            const decodedToken = getDecodedToken()

            let currentUserData = null
            try {
                currentUserData = await getCurrentUser()
            } catch (error) {
                currentUserData = { error: error instanceof Error ? error.message : "Unknown error" }
            }

            setDebugInfo({
                hasToken: !!token,
                tokenLength: token?.length,
                tokenPreview: token?.substring(0, 20) + "...",
                decodedToken,
                currentUserData,
                authContextUser: user,
                authContextAuthenticated: isAuthenticated,
                authContextLoading: loading,
                localStorage: typeof window !== 'undefined' ? {
                    token: localStorage.getItem('token'),
                    accessToken: localStorage.getItem('accessToken'),
                    user: localStorage.getItem('user')
                } : null
            })
        }

        if (typeof window !== 'undefined') {
            gatherDebugInfo()
        }
    }, [user, isAuthenticated, loading])

    const testReservationAPI = async () => {
        setTestResult("Testing...")
        try {
            // Try to get a room first
            const roomsResponse = await apiClient(`${API_ROUTES.ROOMS.CLIENT.DETAIL("62ae41d5-c9f1-412b-8399-9442be763a64")}`)
            console.log("Room data:", roomsResponse)

            // Now try to create a reservation
            const reservationData = {
                room_id: "62ae41d5-c9f1-412b-8399-9442be763a64",
                check_in_date: "2025-06-15T14:00:00",
                check_out_date: "2025-06-16T12:00:00",
                client_name: "Test User",
                client_email: "test@example.com"
            }

            const result = await apiClient(API_ROUTES.RESERVATIONS.CLIENT.CREATE, {
                method: "POST",
                body: JSON.stringify(reservationData),
                requireAuth: true,
            })

            setTestResult(`Success: ${JSON.stringify(result, null, 2)}`)
        } catch (error) {
            setTestResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Authentication Debug Page</h1>

            <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Test Reservation API</h2>
                    <button
                        onClick={testReservationAPI}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Test Reservation Creation
                    </button>
                    {testResult && (
                        <div className="mt-2 p-2 bg-white rounded">
                            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
