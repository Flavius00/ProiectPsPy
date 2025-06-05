from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from application.dtos import (
    HotelCreateRequest, HotelUpdateRequest, HotelResponse,
    RoomCreateRequest, RoomUpdateRequest, RoomResponse,
    RoomImageCreateRequest, RoomImageResponse,
    ReviewCreateRequest, ReviewUpdateRequest, ReviewResponse
)
from application.services import HotelService, RoomService, ReviewService
from infrastructure.database import get_db
from infrastructure.repositories import (
    SQLiteHotelRepository, SQLiteRoomRepository, 
    SQLiteRoomImageRepository, SQLiteReviewRepository
)
from infrastructure.middleware.auth_middleware import (
    require_admin, require_manager_or_admin, require_employee_or_above,
    require_client, require_any_authenticated_user, optional_authentication,
    get_current_user_id
)

router = APIRouter()

# Dependency to get hotel service
def get_hotel_service(db: AsyncSession = Depends(get_db)) -> HotelService:
    hotel_repo = SQLiteHotelRepository(db)
    return HotelService(hotel_repo)

# Dependency to get room service
def get_room_service(db: AsyncSession = Depends(get_db)) -> RoomService:
    room_repo = SQLiteRoomRepository(db)
    room_image_repo = SQLiteRoomImageRepository(db)
    return RoomService(room_repo, room_image_repo)

# Dependency to get review service
def get_review_service(db: AsyncSession = Depends(get_db)) -> ReviewService:
    review_repo = SQLiteReviewRepository(db)
    return ReviewService(review_repo)


# Hotel endpoints
@router.post("/hotels", response_model=HotelResponse, status_code=201)
async def create_hotel(
    hotel_data: HotelCreateRequest,
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(require_manager_or_admin)
):
    """Create a new hotel (Manager/Admin only)"""
    try:
        hotel = await hotel_service.create_hotel(hotel_data)
        return hotel
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/hotels", response_model=List[HotelResponse])
async def get_hotels(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get all hotels with pagination (Public endpoint with optional auth)"""
    try:
        hotels = await hotel_service.get_hotels(skip=skip, limit=limit)
        return hotels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hotels/{hotel_id}", response_model=HotelResponse)
async def get_hotel(
    hotel_id: str,
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get a hotel by ID (Public endpoint with optional auth)"""
    try:
        hotel = await hotel_service.get_hotel_by_id(hotel_id)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        return hotel
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/hotels/{hotel_id}", response_model=HotelResponse)
async def update_hotel(
    hotel_id: str,
    hotel_data: HotelUpdateRequest,
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(require_manager_or_admin)
):
    """Update a hotel (Manager/Admin only)"""
    try:
        hotel = await hotel_service.update_hotel(hotel_id, hotel_data)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        return hotel
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/hotels/{hotel_id}", status_code=204)
async def delete_hotel(
    hotel_id: str,
    hotel_service: HotelService = Depends(get_hotel_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete a hotel (Admin only)"""
    try:
        success = await hotel_service.delete_hotel(hotel_id)
        if not success:
            raise HTTPException(status_code=404, detail="Hotel not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Room endpoints
@router.post("/rooms", response_model=RoomResponse, status_code=201)
async def create_room(
    room_data: RoomCreateRequest,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(require_employee_or_above)
):
    """Create a new room (Employee+ only)"""
    try:
        room = await room_service.create_room(room_data)
        return room
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/rooms", response_model=List[RoomResponse])
async def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get all rooms with pagination (Public endpoint with optional auth)"""
    try:
        rooms = await room_service.get_rooms(skip=skip, limit=limit)
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hotels/{hotel_id}/rooms", response_model=List[RoomResponse])
async def get_rooms_by_hotel(
    hotel_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get all rooms for a specific hotel (Public endpoint with optional auth)"""
    try:
        rooms = await room_service.get_rooms_by_hotel_id(hotel_id)
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get a room by ID (Public endpoint with optional auth)"""
    try:
        room = await room_service.get_room_by_id(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str,
    room_data: RoomUpdateRequest,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(require_employee_or_above)
):
    """Update a room (Employee+ only)"""
    try:
        room = await room_service.update_room(room_id, room_data)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/rooms/{room_id}", status_code=204)
async def delete_room(
    room_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(require_manager_or_admin)
):
    """Delete a room (Manager/Admin only)"""
    try:
        success = await room_service.delete_room(room_id)
        if not success:
            raise HTTPException(status_code=404, detail="Room not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Room Image endpoints
@router.post("/rooms/{room_id}/images", response_model=RoomImageResponse, status_code=201)
async def create_room_image(
    room_id: str,
    image_data: RoomImageCreateRequest,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(require_employee_or_above)
):
    """Add an image to a room (Employee+ only)"""
    try:
        # Set the room_id from the URL parameter
        image_data_dict = image_data.dict()
        image_data_dict['room_id'] = room_id
        image = await room_service.create_room_image(RoomImageCreateRequest(**image_data_dict))
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/rooms/{room_id}/images", response_model=List[RoomImageResponse])
async def get_room_images(
    room_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get all images for a room (Public endpoint with optional auth)"""
    try:
        images = await room_service.get_images_by_room_id(room_id)
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/rooms/{room_id}/images/{image_id}", status_code=204)
async def delete_room_image(
    room_id: str,
    image_id: str,
    room_service: RoomService = Depends(get_room_service),
    current_user: Dict[str, Any] = Depends(require_employee_or_above)
):
    """Delete a room image (Employee+ only)"""
    try:
        success = await room_service.delete_room_image(image_id)
        if not success:
            raise HTTPException(status_code=404, detail="Image not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Review endpoints
@router.post("/rooms/{room_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    room_id: str,
    review_data: ReviewCreateRequest,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(require_client)
):
    """Create a review for a room (Client only)"""
    try:
        # Set the room_id from the URL parameter and user_id from auth
        review_data_dict = review_data.dict()
        review_data_dict['room_id'] = room_id
        review_data_dict['user_id'] = current_user['user_id']
        review = await review_service.create_review(ReviewCreateRequest(**review_data_dict))
        return review
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/rooms/{room_id}/reviews", response_model=List[ReviewResponse])
async def get_room_reviews(
    room_id: str,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get all reviews for a room (Public endpoint with optional auth)"""
    try:
        reviews = await review_service.get_reviews_by_room_id(room_id)
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/reviews", response_model=List[ReviewResponse])
async def get_user_reviews(
    user_id: str,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(require_any_authenticated_user)
):
    """Get all reviews by a user (Authenticated users only - can only see own reviews unless admin/manager)"""
    try:
        # Check if user is accessing their own reviews or has elevated permissions
        if (current_user['user_id'] != user_id and 
            current_user['role'] not in ['ADMIN', 'MANAGER']):
            raise HTTPException(
                status_code=403, 
                detail="You can only view your own reviews"
            )
        
        reviews = await review_service.get_reviews_by_user_id(user_id)
        return reviews
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(optional_authentication)
):
    """Get a review by ID (Public endpoint with optional auth)"""
    try:
        review = await review_service.get_review_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewUpdateRequest,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(require_any_authenticated_user)
):
    """Update a review (Users can only update their own reviews unless admin/manager)"""
    try:
        # First get the review to check ownership
        existing_review = await review_service.get_review_by_id(review_id)
        if not existing_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Check if user owns the review or has elevated permissions
        if (existing_review.user_id != current_user['user_id'] and 
            current_user['role'] not in ['ADMIN', 'MANAGER']):
            raise HTTPException(
                status_code=403, 
                detail="You can only update your own reviews"
            )
        
        review = await review_service.update_review(review_id, review_data)
        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/reviews/{review_id}", status_code=204)
async def delete_review(
    review_id: str,
    review_service: ReviewService = Depends(get_review_service),
    current_user: Dict[str, Any] = Depends(require_any_authenticated_user)
):
    """Delete a review (Users can only delete their own reviews unless admin/manager)"""
    try:
        # First get the review to check ownership
        existing_review = await review_service.get_review_by_id(review_id)
        if not existing_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Check if user owns the review or has elevated permissions
        if (existing_review.user_id != current_user['user_id'] and 
            current_user['role'] not in ['ADMIN', 'MANAGER']):
            raise HTTPException(
                status_code=403, 
                detail="You can only delete your own reviews"
            )
        
        success = await review_service.delete_review(review_id)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
