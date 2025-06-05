import { getAuthHeader, logoutUser } from "./auth"

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined
}

export interface SortParams {
  field: string
  direction: "asc" | "desc"
}

export function buildQueryString(pagination?: PaginationParams, filters?: FilterParams, sort?: SortParams): string {
  const params = new URLSearchParams()

  // Add pagination
  if (pagination) {
    if (pagination.skip !== undefined) params.append("skip", pagination.skip.toString())
    if (pagination.limit !== undefined) params.append("limit", pagination.limit.toString())
  }

  // Add filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })
  }

  // Add sorting
  if (sort) {
    params.append("sort", `${sort.field}:${sort.direction}`)
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

export async function apiClient<T>(
  url: string,
  options: FetchOptions = {},
  pagination?: PaginationParams,
  filters?: FilterParams,
  sort?: SortParams,
): Promise<T> {
  const { requireAuth = false, headers = {}, ...restOptions } = options

  // Build query string if pagination, filters, or sort are provided
  if (pagination || filters || sort) {
    const queryString = buildQueryString(pagination, filters, sort)
    url = `${url}${queryString}`
  }

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (requireAuth) {
    const authHeaders = getAuthHeader()
    Object.assign(requestHeaders, authHeaders)
  }

  try {
    // Log the request for debugging
    console.log(
      `API Request: ${options.method || "GET"} ${url}`,
      options.body ? JSON.parse(options.body as string) : null,
      requireAuth ? "With Auth" : "Without Auth",
      requestHeaders
    )

    const response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    })

    // Log the response status and headers for debugging
    console.log(`API Response: ${response.status} ${response.statusText}`)
    try {
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()))
    } catch (headerError) {
      console.warn("Could not log response headers:", headerError)
    }

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        // Unauthorized - token expired or invalid
        console.error("Authentication error (401): Token invalid or expired")
        await logoutUser()

        // Throw a user-friendly error message
        const errorMessage = "Your session has expired. Please log in again."
        throw new Error(errorMessage)
      }

      if (response.status === 403) {
        // Forbidden - insufficient permissions
        console.error("Authorization error (403): Insufficient permissions")
        const errorMessage = "You don't have permission to access this resource"

        // If we're in a browser context, redirect to unauthorized page
        if (typeof window !== "undefined") {
          window.location.href = "/unauthorized"
        }

        throw new Error(errorMessage)
      }

      // Try to get error details from response
      try {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)

        // Handle validation errors (422)
        if (response.status === 422) {
          if (errorData.detail && Array.isArray(errorData.detail)) {
            // Format validation errors nicely - FastAPI style
            const errorMessages = errorData.detail
              .map((err: any) => {
                const field = Array.isArray(err.loc) ? err.loc.slice(1).join(".") : err.field || "unknown"
                return `${field}: ${err.msg || err.message}`
              })
              .join(", ")
            throw new Error(`Validation error: ${errorMessages}`)
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map((err: any) => `${err.field}: ${err.message}`).join(", ")
            throw new Error(`Validation error: ${errorMessages}`)
          } else if (errorData.detail) {
            throw new Error(errorData.detail)
          }
        }

        throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`)
      } catch (jsonParseError) {
        console.error("Failed to parse error response JSON:", jsonParseError)
        if (jsonParseError instanceof Error && jsonParseError.message.includes("Validation error")) {
          throw jsonParseError // Re-throw validation errors
        }
        throw new Error(`Request failed with status ${response.status}`)
      }
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T
    }

    try {
      const data = await response.json()
      console.log("API Response Data:", data)
      return data
    } catch (jsonError) {
      console.error("Failed to parse success response JSON:", jsonError)
      throw new Error("Invalid response format from server")
    }
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Special function for file uploads
export async function uploadFile(url: string, file: File, options: FetchOptions = {}): Promise<any> {
  const { requireAuth = true, headers = {}, ...restOptions } = options

  const formData = new FormData()
  formData.append("file", file)

  const requestHeaders: HeadersInit = {
    // Don't set Content-Type for multipart/form-data
    ...headers,
  }

  if (requireAuth) {
    const authHeaders = getAuthHeader()
    Object.assign(requestHeaders, authHeaders)
  }

  try {
    console.log(`File Upload Request: POST ${url}`)

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
      ...restOptions,
    })

    console.log(`File Upload Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      // Handle errors similar to apiClient
      if (response.status === 401) {
        await logoutUser()
        throw new Error("Authentication required")
      }

      // Try to get error details
      try {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
      } catch (e) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {}
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("File upload failed:", error)
    throw error
  }
}
