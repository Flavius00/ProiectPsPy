from typing import List, Optional
from datetime import datetime, date
from domain.entities import Reservation, ReservationStatus
from domain.repositories import ReservationRepository, RoomRepository


class ReservationService:
    """Service for handling reservation business logic"""
    
    def __init__(self, reservation_repo: ReservationRepository, room_repo: RoomRepository):
        self.reservation_repo = reservation_repo
        self.room_repo = room_repo
    
    async def create_reservation(
        self,
        room_id: str,
        client_id: Optional[str],
        client_email: str,
        client_name: str,
        check_in_date: datetime,
        check_out_date: datetime,
        notes: Optional[str] = None
    ) -> Reservation:
        """Create a new reservation"""
        
        # Convert datetime to date for validation
        check_in_date_only = check_in_date.date() if isinstance(check_in_date, datetime) else check_in_date
        check_out_date_only = check_out_date.date() if isinstance(check_out_date, datetime) else check_out_date
        
        # Validate dates
        if check_in_date_only >= check_out_date_only:
            raise ValueError("Check-in date must be before check-out date")
        
        if check_in_date_only < datetime.now().date():
            raise ValueError("Check-in date cannot be in the past")
        
        # Handle client_id - use email as fallback if not provided (for guest reservations)
        final_client_id = client_id if client_id else client_email
        
        # Check if room exists
        room = await self.room_repo.get_room_by_id(room_id)
        if not room:
            raise ValueError(f"Room with id {room_id} not found")
        
        # Check room availability
        is_available = await self.reservation_repo.check_room_availability(
            room_id, check_in_date, check_out_date
        )
        if not is_available:
            raise ValueError("Room is not available for the selected dates")
        
        # Calculate total price (simplified - using room price per night)
        nights = (check_out_date_only - check_in_date_only).days
        total_price = room.price * nights
        
        # Create reservation
        reservation = Reservation(
            room_id=room_id,
            client_id=final_client_id,
            client_email=client_email,
            client_name=client_name,
            check_in_date=check_in_date_only,
            check_out_date=check_out_date_only,
            total_price=total_price,
            status=ReservationStatus.PENDING,
            notes=notes
        )
        
        return await self.reservation_repo.create_reservation(reservation)
    
    async def get_reservation_by_id(self, reservation_id: str) -> Optional[Reservation]:
        """Get reservation by ID"""
        return await self.reservation_repo.get_reservation_by_id(reservation_id)
    
    async def get_client_reservations(self, client_id: str) -> List[Reservation]:
        """Get all reservations for a client"""
        return await self.reservation_repo.get_reservations_by_client_id(client_id)
    
    async def get_room_reservations(self, room_id: str) -> List[Reservation]:
        """Get all reservations for a room"""
        return await self.reservation_repo.get_reservations_by_room_id(room_id)
    
    async def get_all_reservations(self, skip: int = 0, limit: int = 100) -> List[Reservation]:
        """Get all reservations with pagination"""
        return await self.reservation_repo.get_reservations(skip, limit)
    
    async def confirm_reservation(self, reservation_id: str, employee_id: str) -> Reservation:
        """Confirm a pending reservation"""
        reservation = await self.reservation_repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise ValueError(f"Reservation with id {reservation_id} not found")
        
        if reservation.status != ReservationStatus.PENDING:
            raise ValueError("Only pending reservations can be confirmed")
        
        reservation.status = ReservationStatus.CONFIRMED
        reservation.employee_id = employee_id
        
        return await self.reservation_repo.update_reservation(reservation)
    
    async def cancel_reservation(self, reservation_id: str, employee_id: Optional[str] = None) -> Reservation:
        """Cancel a reservation"""
        reservation = await self.reservation_repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise ValueError(f"Reservation with id {reservation_id} not found")
        
        if reservation.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            raise ValueError("Cannot cancel a completed or already cancelled reservation")
        
        reservation.status = ReservationStatus.CANCELLED
        if employee_id:
            reservation.employee_id = employee_id
        
        return await self.reservation_repo.update_reservation(reservation)
    
    async def complete_reservation(self, reservation_id: str, employee_id: str) -> Reservation:
        """Mark a reservation as completed"""
        reservation = await self.reservation_repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise ValueError(f"Reservation with id {reservation_id} not found")
        
        if reservation.status != ReservationStatus.CONFIRMED:
            raise ValueError("Only confirmed reservations can be completed")
        
        reservation.status = ReservationStatus.COMPLETED
        reservation.employee_id = employee_id
        
        return await self.reservation_repo.update_reservation(reservation)
    
    async def update_reservation_notes(self, reservation_id: str, notes: str, employee_id: str) -> Reservation:
        """Update reservation notes"""
        reservation = await self.reservation_repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise ValueError(f"Reservation with id {reservation_id} not found")
        
        reservation.notes = notes
        reservation.employee_id = employee_id
        
        return await self.reservation_repo.update_reservation(reservation)
    
    async def check_room_availability(self, room_id: str, check_in_date: datetime, check_out_date: datetime) -> bool:
        """Check if a room is available for given dates"""
        return await self.reservation_repo.check_room_availability(room_id, check_in_date, check_out_date)
