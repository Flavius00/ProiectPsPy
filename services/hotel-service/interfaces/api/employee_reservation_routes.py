from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from infrastructure.database import get_db
from infrastructure.repositories import SQLiteReservationRepository, SQLiteRoomRepository
from application.reservation_service import ReservationService
from interfaces.dto.reservation_dto import (
    ReservationResponse,
    UpdateReservationStatusRequest,
    UpdateReservationNotesRequest,
    ReservationListResponse
)
from interfaces.auth import get_current_user, require_employee


router = APIRouter(prefix="/employee/reservations", tags=["Employee Reservations"])


def get_reservation_service(db: AsyncSession = Depends(get_db)) -> ReservationService:
    """Dependency to get reservation service"""
    reservation_repo = SQLiteReservationRepository(db)
    room_repo = SQLiteRoomRepository(db)
    return ReservationService(reservation_repo, room_repo)


@router.get("/", response_model=ReservationListResponse)
async def get_all_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Get all reservations with pagination (employee only)"""
    try:
        reservations = await service.get_all_reservations(skip=skip, limit=limit)
        
        return ReservationListResponse(
            reservations=[ReservationResponse.model_validate(r) for r in reservations],
            total=len(reservations),  # In a real app, you'd get the actual total count
            skip=skip,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get reservations")


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Get a specific reservation by ID (employee only)"""
    try:
        reservation = await service.get_reservation_by_id(reservation_id)
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        
        return ReservationResponse.model_validate(reservation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get reservation")


@router.get("/room/{room_id}", response_model=List[ReservationResponse])
async def get_room_reservations(
    room_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Get all reservations for a specific room (employee only)"""
    try:
        reservations = await service.get_room_reservations(room_id)
        return [ReservationResponse.model_validate(r) for r in reservations]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get room reservations")


@router.get("/client/{client_id}", response_model=List[ReservationResponse])
async def get_client_reservations(
    client_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Get all reservations for a specific client (employee only)"""
    try:
        reservations = await service.get_client_reservations(client_id)
        return [ReservationResponse.model_validate(r) for r in reservations]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get client reservations")


@router.patch("/{reservation_id}/status", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: str,
    request: UpdateReservationStatusRequest,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Update reservation status (employee only)"""
    try:
        employee_id = current_user["sub"]
        
        if request.status.value == "confirmed":
            reservation = await service.confirm_reservation(reservation_id, employee_id)
        elif request.status.value == "cancelled":
            reservation = await service.cancel_reservation(reservation_id, employee_id)
        elif request.status.value == "completed":
            reservation = await service.complete_reservation(reservation_id, employee_id)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status transition")
        
        # Update notes if provided
        if request.notes:
            reservation = await service.update_reservation_notes(reservation_id, request.notes, employee_id)
        
        return ReservationResponse.model_validate(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update reservation status")


@router.patch("/{reservation_id}/notes", response_model=ReservationResponse)
async def update_reservation_notes(
    reservation_id: str,
    request: UpdateReservationNotesRequest,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Update reservation notes (employee only)"""
    try:
        employee_id = current_user["sub"]
        reservation = await service.update_reservation_notes(reservation_id, request.notes, employee_id)
        return ReservationResponse.from_orm(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update reservation notes")


@router.post("/{reservation_id}/confirm", response_model=ReservationResponse)
async def confirm_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Confirm a pending reservation (employee only)"""
    try:
        employee_id = current_user["sub"]
        reservation = await service.confirm_reservation(reservation_id, employee_id)
        return ReservationResponse.from_orm(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to confirm reservation")


@router.post("/{reservation_id}/complete", response_model=ReservationResponse)
async def complete_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Mark a reservation as completed (employee only)"""
    try:
        employee_id = current_user["sub"]
        reservation = await service.complete_reservation(reservation_id, employee_id)
        return ReservationResponse.from_orm(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to complete reservation")


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_reservation(
    reservation_id: str,
    service: ReservationService = Depends(get_reservation_service),
    current_user: dict = Depends(require_employee)
):
    """Cancel a reservation (employee only)"""
    try:
        employee_id = current_user["sub"]
        await service.cancel_reservation(reservation_id, employee_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to cancel reservation")
