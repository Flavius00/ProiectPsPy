from abc import ABC, abstractmethod
from typing import Optional, List
from datetime import date
from domain.entities import Hotel, Room, RoomImage, Review, Reservation


class HotelRepository(ABC):
    """Abstract hotel repository interface"""
    
    @abstractmethod
    async def create_hotel(self, hotel: Hotel) -> Hotel:
        pass
    
    @abstractmethod
    async def get_hotel_by_id(self, hotel_id: str) -> Optional[Hotel]:
        pass
    
    @abstractmethod
    async def get_hotels(self, skip: int = 0, limit: int = 100) -> List[Hotel]:
        pass
    
    @abstractmethod
    async def update_hotel(self, hotel: Hotel) -> Hotel:
        pass
    
    @abstractmethod
    async def delete_hotel(self, hotel_id: str) -> bool:
        pass


class RoomRepository(ABC):
    """Abstract room repository interface"""
    
    @abstractmethod
    async def create_room(self, room: Room) -> Room:
        pass
    
    @abstractmethod
    async def get_room_by_id(self, room_id: str) -> Optional[Room]:
        pass
    
    @abstractmethod
    async def get_rooms_by_hotel_id(self, hotel_id: str) -> List[Room]:
        pass
    
    @abstractmethod
    async def get_rooms(self, skip: int = 0, limit: int = 100) -> List[Room]:
        pass
    
    @abstractmethod
    async def update_room(self, room: Room) -> Room:
        pass
    
    @abstractmethod
    async def delete_room(self, room_id: str) -> bool:
        pass


class RoomImageRepository(ABC):
    """Abstract room image repository interface"""
    
    @abstractmethod
    async def create_room_image(self, room_image: RoomImage) -> RoomImage:
        pass
    
    @abstractmethod
    async def get_room_image_by_id(self, image_id: str) -> Optional[RoomImage]:
        pass
    
    @abstractmethod
    async def get_images_by_room_id(self, room_id: str) -> List[RoomImage]:
        pass
    
    @abstractmethod
    async def delete_room_image(self, image_id: str) -> bool:
        pass


class ReviewRepository(ABC):
    """Abstract review repository interface"""
    
    @abstractmethod
    async def create_review(self, review: Review) -> Review:
        pass
    
    @abstractmethod
    async def get_review_by_id(self, review_id: str) -> Optional[Review]:
        pass
    
    @abstractmethod
    async def get_reviews_by_room_id(self, room_id: str) -> List[Review]:
        pass
    
    @abstractmethod
    async def get_reviews_by_user_id(self, user_id: str) -> List[Review]:
        pass
    
    @abstractmethod
    async def update_review(self, review: Review) -> Review:
        pass
    
    @abstractmethod
    async def delete_review(self, review_id: str) -> bool:
        pass


class ReservationRepository(ABC):
    """Abstract reservation repository interface"""
    
    @abstractmethod
    async def create_reservation(self, reservation: Reservation) -> Reservation:
        pass
    
    @abstractmethod
    async def get_reservation_by_id(self, reservation_id: str) -> Optional[Reservation]:
        pass
    
    @abstractmethod
    async def get_reservations_by_client_id(self, client_id: str) -> List[Reservation]:
        pass
    
    @abstractmethod
    async def get_reservations_by_room_id(self, room_id: str) -> List[Reservation]:
        pass
    
    @abstractmethod
    async def get_reservations(self, skip: int = 0, limit: int = 100) -> List[Reservation]:
        pass
    
    @abstractmethod
    async def update_reservation(self, reservation: Reservation) -> Reservation:
        pass
    
    @abstractmethod
    async def delete_reservation(self, reservation_id: str) -> bool:
        pass
    
    @abstractmethod
    async def check_room_availability(self, room_id: str, check_in: date, check_out: date) -> bool:
        pass
