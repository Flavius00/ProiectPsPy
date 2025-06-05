from typing import Optional, List
from datetime import datetime
import uuid
from domain.entities import Hotel, Room, RoomImage, Review
from domain.repositories import HotelRepository, RoomRepository, RoomImageRepository, ReviewRepository
from application.dtos import (
    HotelCreateRequest, HotelUpdateRequest, HotelResponse,
    RoomCreateRequest, RoomUpdateRequest, RoomResponse,
    RoomImageCreateRequest, RoomImageResponse,
    ReviewCreateRequest, ReviewUpdateRequest, ReviewResponse
)


class HotelService:
    """Hotel management application service"""
    
    def __init__(self, hotel_repository: HotelRepository):
        self.hotel_repository = hotel_repository
    
    async def create_hotel(self, request: HotelCreateRequest) -> HotelResponse:
        """Create a new hotel"""
        hotel = Hotel(
            name=request.name,
            location=request.location,
            address=request.address,
            description=request.description,
            amenities=request.amenities
        )
        
        created_hotel = await self.hotel_repository.create_hotel(hotel)
        return HotelResponse.from_orm(created_hotel)
    
    async def get_hotel_by_id(self, hotel_id: str) -> Optional[HotelResponse]:
        """Get hotel by ID"""
        hotel = await self.hotel_repository.get_hotel_by_id(hotel_id)
        return HotelResponse.from_orm(hotel) if hotel else None
    
    async def get_hotels(self, skip: int = 0, limit: int = 100) -> List[HotelResponse]:
        """Get list of hotels"""
        hotels = await self.hotel_repository.get_hotels(skip=skip, limit=limit)
        return [HotelResponse.from_orm(hotel) for hotel in hotels]
    
    async def update_hotel(self, hotel_id: str, request: HotelUpdateRequest) -> Optional[HotelResponse]:
        """Update hotel"""
        existing_hotel = await self.hotel_repository.get_hotel_by_id(hotel_id)
        if not existing_hotel:
            return None
        
        # Update fields
        updated_hotel = Hotel(
            id=existing_hotel.id,
            name=request.name,
            location=request.location,
            address=request.address,
            description=request.description,
            amenities=request.amenities,
            created_at=existing_hotel.created_at,
            updated_at=datetime.utcnow()
        )
        
        result = await self.hotel_repository.update_hotel(updated_hotel)
        return HotelResponse.from_orm(result)
    
    async def delete_hotel(self, hotel_id: str) -> bool:
        """Delete hotel"""
        return await self.hotel_repository.delete_hotel(hotel_id)


class RoomService:
    """Room management application service"""
    
    def __init__(self, room_repository: RoomRepository, room_image_repository: RoomImageRepository):
        self.room_repository = room_repository
        self.room_image_repository = room_image_repository
    
    async def create_room(self, request: RoomCreateRequest) -> RoomResponse:
        """Create a new room"""
        room = Room(
            hotel_id=request.hotel_id,
            room_number=request.room_number,
            room_type=request.room_type,
            price=request.price,
            position=request.position,
            facilities=request.facilities,
            is_available=request.is_available
        )
        
        created_room = await self.room_repository.create_room(room)
        return RoomResponse.from_orm(created_room)
    
    async def get_room_by_id(self, room_id: str) -> Optional[RoomResponse]:
        """Get room by ID"""
        room = await self.room_repository.get_room_by_id(room_id)
        return RoomResponse.from_orm(room) if room else None
    
    async def get_rooms_by_hotel_id(self, hotel_id: str) -> List[RoomResponse]:
        """Get rooms by hotel ID"""
        rooms = await self.room_repository.get_rooms_by_hotel_id(hotel_id)
        return [RoomResponse.from_orm(room) for room in rooms]
    
    async def get_rooms(self, skip: int = 0, limit: int = 100) -> List[RoomResponse]:
        """Get all rooms with pagination"""
        rooms = await self.room_repository.get_rooms(skip=skip, limit=limit)
        return [RoomResponse.from_orm(room) for room in rooms]
    
    async def update_room(self, room_id: str, request: RoomUpdateRequest) -> Optional[RoomResponse]:
        """Update room"""
        existing_room = await self.room_repository.get_room_by_id(room_id)
        if not existing_room:
            return None
        
        # Update fields
        updated_room = Room(
            id=existing_room.id,
            hotel_id=request.hotel_id,
            room_number=request.room_number,
            room_type=request.room_type,
            price=request.price,
            position=request.position,
            facilities=request.facilities,
            is_available=request.is_available,
            created_at=existing_room.created_at,
            updated_at=datetime.utcnow()
        )
        
        result = await self.room_repository.update_room(updated_room)
        return RoomResponse.from_orm(result)
    
    async def delete_room(self, room_id: str) -> bool:
        """Delete room"""
        return await self.room_repository.delete_room(room_id)
    
    async def create_room_image(self, request: RoomImageCreateRequest) -> RoomImageResponse:
        """Add image to room"""
        image = RoomImage(
            room_id=request.room_id,
            image_url=request.image_url,
            alt_text=request.alt_text,
            display_order=request.display_order
        )
        
        created_image = await self.room_image_repository.create_room_image(image)
        return RoomImageResponse.from_orm(created_image)
    
    async def get_images_by_room_id(self, room_id: str) -> List[RoomImageResponse]:
        """Get room images"""
        images = await self.room_image_repository.get_images_by_room_id(room_id)
        return [RoomImageResponse.from_orm(image) for image in images]
    
    async def delete_room_image(self, image_id: str) -> bool:
        """Delete room image"""
        return await self.room_image_repository.delete_room_image(image_id)


class ReviewService:
    """Review management application service"""
    
    def __init__(self, review_repository: ReviewRepository):
        self.review_repository = review_repository
    
    async def create_review(self, request: ReviewCreateRequest) -> ReviewResponse:
        """Create a review for a room"""
        # Validate rating is between 1-5
        if request.rating < 1 or request.rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        review = Review(
            room_id=request.room_id,
            user_id=request.user_id,
            rating=request.rating,
            comment=request.comment
        )
        
        created_review = await self.review_repository.create_review(review)
        return ReviewResponse.from_orm(created_review)
    
    async def get_review_by_id(self, review_id: str) -> Optional[ReviewResponse]:
        """Get review by ID"""
        review = await self.review_repository.get_review_by_id(review_id)
        return ReviewResponse.from_orm(review) if review else None
    
    async def get_reviews_by_room_id(self, room_id: str) -> List[ReviewResponse]:
        """Get reviews for a room"""
        reviews = await self.review_repository.get_reviews_by_room_id(room_id)
        return [ReviewResponse.from_orm(review) for review in reviews]
    
    async def get_reviews_by_user_id(self, user_id: str) -> List[ReviewResponse]:
        """Get reviews by user"""
        reviews = await self.review_repository.get_reviews_by_user_id(user_id)
        return [ReviewResponse.from_orm(review) for review in reviews]
    
    async def update_review(self, review_id: str, request: ReviewUpdateRequest) -> Optional[ReviewResponse]:
        """Update review"""
        existing_review = await self.review_repository.get_review_by_id(review_id)
        if not existing_review:
            return None
        
        # Validate rating is between 1-5
        if request.rating < 1 or request.rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        # Update fields
        updated_review = Review(
            id=existing_review.id,
            room_id=existing_review.room_id,
            user_id=existing_review.user_id,
            rating=request.rating,
            comment=request.comment,
            created_at=existing_review.created_at,
            updated_at=datetime.utcnow()
        )
        
        result = await self.review_repository.update_review(updated_review)
        return ReviewResponse.from_orm(result)
    
    async def delete_review(self, review_id: str) -> bool:
        """Delete review"""
        return await self.review_repository.delete_review(review_id)
