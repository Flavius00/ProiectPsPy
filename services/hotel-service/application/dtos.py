from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Hotel DTOs
class HotelCreateRequest(BaseModel):
    name: str
    location: str
    address: str
    description: Optional[str] = None
    amenities: Optional[dict] = None


class HotelUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    amenities: Optional[dict] = None


class HotelResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    name: str
    location: str
    address: str
    description: Optional[str] = None
    amenities: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class HotelListResponse(BaseModel):
    hotels: List[HotelResponse]
    total: int
    page: int
    per_page: int


# Room DTOs
class RoomCreateRequest(BaseModel):
    hotel_id: str
    room_number: str
    room_type: str
    price: float
    position: Optional[str] = None
    facilities: Optional[dict] = None
    is_available: bool = True


class RoomUpdateRequest(BaseModel):
    hotel_id: Optional[str] = None
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    price: Optional[float] = None
    position: Optional[str] = None
    facilities: Optional[dict] = None
    is_available: Optional[bool] = None


class RoomResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    hotel_id: str
    room_number: str
    room_type: str
    price: float
    position: Optional[str] = None
    facilities: Optional[dict] = None
    is_available: bool
    created_at: datetime
    updated_at: datetime


class RoomListResponse(BaseModel):
    rooms: List[RoomResponse]
    total: int
    page: int
    per_page: int


# Room Image DTOs
class RoomImageCreateRequest(BaseModel):
    room_id: Optional[str] = None  # Will be set from URL path
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 1


class RoomImageResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    room_id: str
    image_url: str
    alt_text: Optional[str] = None
    display_order: int
    created_at: datetime


# Review DTOs
class ReviewCreateRequest(BaseModel):
    room_id: Optional[str] = None  # Will be set from URL path
    user_id: str
    rating: int  # 1-5
    comment: str


class ReviewUpdateRequest(BaseModel):
    rating: int  # 1-5
    comment: str


class ReviewResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    room_id: str
    user_id: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    total: int
    average_rating: float
    page: int
    per_page: int
