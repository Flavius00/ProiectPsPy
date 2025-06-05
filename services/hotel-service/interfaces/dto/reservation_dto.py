from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class ReservationStatus(str, Enum):
    """Reservation status enum for API"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class CreateReservationRequest(BaseModel):
    """Request model for creating a reservation"""
    room_id: str
    client_id: Optional[str] = None
    client_email: EmailStr
    client_name: str
    check_in_date: datetime
    check_out_date: datetime
    notes: Optional[str] = None
    
    @validator('check_out_date')
    def check_out_after_check_in(cls, v, values):
        if 'check_in_date' in values and v <= values['check_in_date']:
            raise ValueError('Check-out date must be after check-in date')
        return v
    
    @validator('check_in_date')
    def check_in_not_in_past(cls, v):
        if v < datetime.now():
            raise ValueError('Check-in date cannot be in the past')
        return v


class UpdateReservationStatusRequest(BaseModel):
    """Request model for updating reservation status"""
    status: ReservationStatus
    notes: Optional[str] = None


class UpdateReservationNotesRequest(BaseModel):
    """Request model for updating reservation notes"""
    notes: str


class CheckAvailabilityRequest(BaseModel):
    """Request model for checking room availability"""
    room_id: str
    check_in_date: datetime
    check_out_date: datetime
    
    @validator('check_out_date')
    def check_out_after_check_in(cls, v, values):
        if 'check_in_date' in values and v <= values['check_in_date']:
            raise ValueError('Check-out date must be after check-in date')
        return v


class ReservationResponse(BaseModel):
    """Response model for reservation data"""
    id: str
    room_id: str
    client_id: Optional[str]
    client_email: str
    client_name: str
    employee_id: Optional[str]
    check_in_date: datetime
    check_out_date: datetime
    total_price: float
    status: ReservationStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AvailabilityResponse(BaseModel):
    """Response model for availability check"""
    room_id: str
    check_in_date: datetime
    check_out_date: datetime
    is_available: bool


class ReservationListResponse(BaseModel):
    """Response model for paginated reservation list"""
    reservations: list[ReservationResponse]
    total: int
    skip: int
    limit: int
