// API endpoints configuration
export const API_CONFIG = {
  AUTH_SERVICE: "http://localhost:8001",
  HOTEL_SERVICE: "http://localhost:8002",
  USER_SERVICE: "http://localhost:8003",
}

// API routes
export const API_ROUTES = {
  // Auth Service
  AUTH: {
    REGISTER: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/register`,
    LOGIN: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/login`,
    LOGOUT: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/logout`,
    ME: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/me`,
  },

  // User Service
  USERS: {
    PROFILE: (userId: string) => `${API_CONFIG.USER_SERVICE}/api/v1/users/profile/${userId}`,
    ADMIN: {
      LIST: `${API_CONFIG.USER_SERVICE}/api/v1/admin/users`,
      CREATE: `${API_CONFIG.USER_SERVICE}/api/v1/admin/users`,
      UPDATE: (userId: string) => `${API_CONFIG.USER_SERVICE}/api/v1/admin/users/${userId}`,
      DELETE: (userId: string) => `${API_CONFIG.USER_SERVICE}/api/v1/admin/users/${userId}`,
      EXPORT: `${API_CONFIG.USER_SERVICE}/api/v1/admin/users/export`,
    },
  },

  // Hotel Service
  HOTELS: {
    // Admin/Management endpoints
    ADMIN: {
      LIST: `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels`,
      DETAIL: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels/${hotelId}`,
      CREATE: `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels`,
      UPDATE: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels/${hotelId}`,
      DELETE: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels/${hotelId}`,
    },
    // Client/Public endpoints
    CLIENT: {
      LIST: `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/hotels`,
      DETAIL: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/hotels/${hotelId}`,
      SEARCH: `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/search/hotels`,
    },
  },

  ROOMS: {
    // Admin/Management endpoints
    ADMIN: {
      LIST: `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms`,
      HOTEL_ROOMS: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/hotels/${hotelId}/rooms`,
      DETAIL: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}`,
      CREATE: `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms`,
      UPDATE: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}`,
      DELETE: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}`,
      IMAGES: {
        LIST: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}/images`,
        ADD: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}/images`,
        DELETE: (roomId: string, imageId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}/images/${imageId}`,
      },
    },
    // Client/Public endpoints
    CLIENT: {
      HOTEL_ROOMS: (hotelId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/hotels/${hotelId}/rooms`,
      DETAIL: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/rooms/${roomId}`,
      SEARCH: `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/search/rooms`,
    },
  },

  REVIEWS: {
    // Admin/Management endpoints
    ADMIN: {
      ROOM_REVIEWS: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}/reviews`,
      USER_REVIEWS: (userId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/users/${userId}/reviews`,
      DETAIL: (reviewId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/reviews/${reviewId}`,
      UPDATE: (reviewId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/reviews/${reviewId}`,
      DELETE: (reviewId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/reviews/${reviewId}`,
    },
    // Client/Public endpoints
    CLIENT: {
      ROOM_REVIEWS: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/rooms/${roomId}/reviews`,
      CREATE: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/rooms/${roomId}/reviews`,
    },
  },

  RESERVATIONS: {
    CLIENT: {
      LIST: `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/reservations/my`,
      CREATE: `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/reservations/`,
      DETAIL: (reservationId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/reservations/${reservationId}`,
      CANCEL: (reservationId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/client/reservations/${reservationId}`,
    },
    EMPLOYEE: {
      LIST: `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations`,
      CREATE: `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations`,
      DETAIL: (reservationId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations/${reservationId}`,
      UPDATE: (reservationId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations/${reservationId}`,
      CANCEL: (reservationId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations/${reservationId}/cancel`,
      CLIENT_RESERVATIONS: (clientId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations/client/${clientId}`,
      ROOM_RESERVATIONS: (roomId: string) => `${API_CONFIG.HOTEL_SERVICE}/api/v1/employee/reservations/room/${roomId}`,
    },
  },
}
