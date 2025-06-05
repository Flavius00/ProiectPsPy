from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from infrastructure.database import get_db
from infrastructure.repositories import SQLiteReservationRepository, SQLiteRoomRepository
from application.reservation_service import ReservationService
from interfaces.dto.reservation_dto import (
    CreateReservationRequest,
    ReservationResponse,
    CheckAvailabilityRequest,
    AvailabilityResponse
)
from interfaces.auth import get_current_user


router = APIRouter(prefix="/client/reservations", tags=["Client Reservations"])


def get_reservation_service(db: AsyncSession = Depends(get_db)) -> ReservationService:
    """Dependency to get reservation service"""
    reservation_repo = SQLiteReservationRepository(db)
    room_repo = SQLiteRoomRepository(db)
    return ReservationService(reservation_repo, room_repo)


@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    request: CreateReservationRequest,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(get_current_user)
):
    """Create a new reservation as a client"""
    try:
        # If user is authenticated, use their user_id, otherwise allow guest reservations
        client_id = current_user.get("sub") if current_user else request.client_id
        
        reservation = await service.create_reservation(
            room_id=request.room_id,
            client_id=client_id,
            client_email=request.client_email,
            client_name=request.client_name,
            check_in_date=request.check_in_date,
            check_out_date=request.check_out_date,
            notes=request.notes
        )
        
        return ReservationResponse.model_validate(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error creating reservation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create reservation: {str(e)}")


@router.get("/my", response_model=List[ReservationResponse])
async def get_my_reservations(
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(get_current_user)
):
    """Get all reservations for the current authenticated user"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    try:
        client_id = current_user["sub"]
        reservations = await service.get_client_reservations(client_id)
        return [ReservationResponse.model_validate(r) for r in reservations]
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error getting reservations for client {current_user.get('sub')}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get reservations: {str(e)}")


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific reservation by ID (only if it belongs to the current user)"""
    try:
        reservation = await service.get_reservation_by_id(reservation_id)
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        
        # Check if the reservation belongs to the current user (if authenticated)
        if current_user and reservation.client_id != current_user["sub"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return ReservationResponse.model_validate(reservation)
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error getting reservation {reservation_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get reservation: {str(e)}")


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(get_current_user)
):
    """Cancel a reservation (only if it belongs to the current user)"""
    try:
        reservation = await service.get_reservation_by_id(reservation_id)
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        
        # Check if the reservation belongs to the current user (if authenticated)
        if current_user and reservation.client_id != current_user["sub"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        await service.cancel_reservation(reservation_id)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error cancelling reservation {reservation_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to cancel reservation: {str(e)}")


@router.post("/check-availability", response_model=AvailabilityResponse)
async def check_availability(
    request: CheckAvailabilityRequest,
    service: ReservationService = Depends(get_reservation_service)
):
    """Check room availability for given dates"""
    try:
        is_available = await service.check_room_availability(
            room_id=request.room_id,
            check_in_date=request.check_in_date,
            check_out_date=request.check_out_date
        )
        
        return AvailabilityResponse(
            room_id=request.room_id,
            check_in_date=request.check_in_date,
            check_out_date=request.check_out_date,
            is_available=is_available
        )
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error checking availability: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to check availability: {str(e)}")
