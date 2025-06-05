from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, date
from enum import Enum


class Hotel(BaseModel):
    """Hotel domain entity"""
    id: Optional[str] = None
    name: str
    location: str
    address: str
    description: Optional[str] = None
    amenities: Optional[Dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Room(BaseModel):
    """Room domain entity"""
    id: Optional[str] = None
    hotel_id: str
    room_number: str
    room_type: str
    price: float
    position: Optional[str] = None
    facilities: Optional[Dict] = None
    is_available: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoomImage(BaseModel):
    """Room image domain entity"""
    id: Optional[str] = None
    room_id: str
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Review(BaseModel):
    """Review domain entity"""
    id: Optional[str] = None
    room_id: str
    user_id: str
    rating: int  # 1-5
    comment: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReservationStatus(str, Enum):
    """Reservation status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Reservation(BaseModel):
    """Reservation domain entity"""
    id: Optional[str] = None
    room_id: str
    client_id: str  # User ID from auth service
    client_email: str
    client_name: str
    employee_id: Optional[str] = None  # Employee who processed reservation
    check_in_date: date
    check_out_date: date
    total_price: float
    status: ReservationStatus = ReservationStatus.PENDING
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
