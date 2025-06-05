from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from application.services import HotelService, RoomService, ReviewService
from application.dtos import HotelResponse, RoomResponse, ReviewResponse
from infrastructure.repositories import (
    SQLiteHotelRepository, SQLiteRoomRepository, SQLiteRoomImageRepository, SQLiteReviewRepository
)
from infrastructure.database import get_db
from infrastructure.middleware.auth_middleware import optional_authentication

router = APIRouter(prefix="/client", tags=["Client API"])

# Dependency injection
def get_hotel_service(db: AsyncSession = Depends(get_db)) -> HotelService:
    hotel_repo = SQLiteHotelRepository(db)
    return HotelService(hotel_repo)

def get_room_service(db: AsyncSession = Depends(get_db)) -> RoomService:
    room_repo = SQLiteRoomRepository(db)
    room_image_repo = SQLiteRoomImageRepository(db)
    return RoomService(room_repo, room_image_repo)

def get_review_service(db: AsyncSession = Depends(get_db)) -> ReviewService:
    review_repo = SQLiteReviewRepository(db)
    return ReviewService(review_repo)


@router.get("/hotels", response_model=List[HotelResponse])
async def browse_hotels(
    location: Optional[str] = Query(None, description="Filter by location"),
    skip: int = Query(0, ge=0, description="Number of hotels to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of hotels to return"),
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Browse available hotels (CLIENT VIEW - Public with optional auth)"""
    try:
        hotels = await hotel_service.get_hotels(skip=skip, limit=limit)
        
        # Filter by location if provided
        if location:
            hotels = [hotel for hotel in hotels if location.lower() in hotel.location.lower()]
        
        return hotels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hotels/{hotel_id}", response_model=HotelResponse)
async def view_hotel_details(
    hotel_id: str,
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """View hotel details (CLIENT VIEW - Public with optional auth)"""
    try:
        hotel = await hotel_service.get_hotel_by_id(hotel_id)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        return hotel
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hotels/{hotel_id}/rooms", response_model=List[RoomResponse])
async def browse_hotel_rooms(
    hotel_id: str,
    room_type: Optional[str] = Query(None, description="Filter by room type"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    available_only: bool = Query(True, description="Show only available rooms"),
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Browse available rooms in a hotel (CLIENT VIEW - Public with optional auth)"""
    try:
        rooms = await room_service.get_rooms_by_hotel_id(hotel_id)
        
        # Apply filters
        if available_only:
            rooms = [room for room in rooms if room.is_available]
        
        if room_type:
            rooms = [room for room in rooms if room_type.lower() in room.room_type.lower()]
        
        if min_price is not None:
            rooms = [room for room in rooms if room.price >= min_price]
        
        if max_price is not None:
            rooms = [room for room in rooms if room.price <= max_price]
        
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def view_room_details(
    room_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """View room details (CLIENT VIEW - Public with optional auth)"""
    try:
        room = await room_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{room_id}/reviews", response_model=List[ReviewResponse])
async def view_room_reviews(
    room_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    min_rating: Optional[int] = Query(None, ge=1, le=5, description="Minimum rating filter"),
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """View room reviews and ratings (CLIENT VIEW - Public with optional auth)"""
    try:
        reviews = await review_service.get_reviews_by_room_id(room_id)
        
        # Apply rating filter if provided
        if min_rating is not None:
            reviews = [review for review in reviews if review.rating >= min_rating]
        
        # Apply pagination
        total_reviews = len(reviews)
        reviews = reviews[skip:skip + limit]
        
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/hotels", response_model=List[HotelResponse])
async def search_hotels(
    q: str = Query(..., min_length=2, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Search hotels by name, location, or description (CLIENT VIEW - Public with optional auth)"""
    try:
        all_hotels = await hotel_service.get_hotels(skip=0, limit=1000)  # Get more for searching
        
        # Simple text search (in a real app, you'd use a proper search engine)
        query_lower = q.lower()
        matching_hotels = []
        
        for hotel in all_hotels:
            # Search in name, location, address, and description
            searchable_text = f"{hotel.name} {hotel.location} {hotel.address} {hotel.description or ''}".lower()
            if query_lower in searchable_text:
                matching_hotels.append(hotel)
        
        # Apply pagination
        total_matches = len(matching_hotels)
        results = matching_hotels[skip:skip + limit]
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/rooms", response_model=List[RoomResponse])
async def search_rooms(
    hotel_id: Optional[str] = Query(None, description="Filter by hotel"),
    room_type: Optional[str] = Query(None, description="Filter by room type"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    available_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Advanced room search with filters (CLIENT VIEW - Public with optional auth)"""
    try:
        if hotel_id:
            rooms = await room_service.get_rooms_by_hotel_id(hotel_id)
        else:
            rooms = await room_service.get_rooms(skip=0, limit=1000)  # Get more for filtering
        
        # Apply filters
        if available_only:
            rooms = [room for room in rooms if room.is_available]
        
        if room_type:
            rooms = [room for room in rooms if room_type.lower() in room.room_type.lower()]
        
        if min_price is not None:
            rooms = [room for room in rooms if room.price >= min_price]
        
        if max_price is not None:
            rooms = [room for room in rooms if room.price <= max_price]
        
        # Apply pagination
        results = rooms[skip:skip + limit]
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
