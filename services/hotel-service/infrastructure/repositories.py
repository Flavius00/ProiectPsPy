from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import json
import uuid
from datetime import datetime

from domain.entities import Hotel, Room, RoomImage, Review, Reservation, ReservationStatus
from domain.repositories import HotelRepository, RoomRepository, RoomImageRepository, ReviewRepository, ReservationRepository
from infrastructure.database import HotelModel, RoomModel, RoomImageModel, ReviewModel, ReservationModel


class SQLiteHotelRepository(HotelRepository):
    """SQLite implementation of hotel repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: HotelModel) -> Hotel:
        """Convert SQLAlchemy model to domain entity"""
        amenities = json.loads(model.amenities) if model.amenities else None
        return Hotel(
            id=model.id,
            name=model.name,
            location=model.location,
            address=model.address,
            description=model.description,
            amenities=amenities,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, hotel: Hotel) -> HotelModel:
        """Convert domain entity to SQLAlchemy model"""
        amenities_json = json.dumps(hotel.amenities) if hotel.amenities else None
        return HotelModel(
            id=hotel.id or str(uuid.uuid4()),
            name=hotel.name,
            location=hotel.location,
            address=hotel.address,
            description=hotel.description,
            amenities=amenities_json,
            created_at=hotel.created_at or datetime.utcnow(),
            updated_at=hotel.updated_at or datetime.utcnow()
        )
    
    async def create_hotel(self, hotel: Hotel) -> Hotel:
        try:
            if not hotel.id:
                hotel.id = str(uuid.uuid4())
            if not hotel.created_at:
                hotel.created_at = datetime.utcnow()
            if not hotel.updated_at:
                hotel.updated_at = datetime.utcnow()
                
            db_hotel = self._entity_to_model(hotel)
            self.db.add(db_hotel)
            await self.db.commit()
            await self.db.refresh(db_hotel)
            return self._model_to_entity(db_hotel)
        except Exception as e:
            await self.db.rollback()
            raise e
    
    async def get_hotel_by_id(self, hotel_id: str) -> Optional[Hotel]:
        result = await self.db.execute(
            select(HotelModel).where(HotelModel.id == hotel_id)
        )
        db_hotel = result.scalar_one_or_none()
        return self._model_to_entity(db_hotel) if db_hotel else None
    
    async def get_hotels(self, skip: int = 0, limit: int = 100) -> List[Hotel]:
        result = await self.db.execute(
            select(HotelModel).offset(skip).limit(limit)
        )
        db_hotels = result.scalars().all()
        return [self._model_to_entity(hotel) for hotel in db_hotels]
    
    async def update_hotel(self, hotel: Hotel) -> Hotel:
        result = await self.db.execute(
            select(HotelModel).where(HotelModel.id == hotel.id)
        )
        db_hotel = result.scalar_one_or_none()
        
        if not db_hotel:
            raise ValueError(f"Hotel with id {hotel.id} not found")
        
        # Update fields
        db_hotel.name = hotel.name
        db_hotel.location = hotel.location
        db_hotel.address = hotel.address
        db_hotel.description = hotel.description
        db_hotel.amenities = json.dumps(hotel.amenities) if hotel.amenities else None
        db_hotel.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(db_hotel)
        return self._model_to_entity(db_hotel)
    
    async def delete_hotel(self, hotel_id: str) -> bool:
        result = await self.db.execute(
            select(HotelModel).where(HotelModel.id == hotel_id)
        )
        db_hotel = result.scalar_one_or_none()
        
        if not db_hotel:
            return False
        
        await self.db.delete(db_hotel)
        await self.db.commit()
        return True


class SQLiteRoomRepository(RoomRepository):
    """SQLite implementation of room repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: RoomModel) -> Room:
        """Convert SQLAlchemy model to domain entity"""
        facilities = json.loads(model.facilities) if model.facilities else None
        return Room(
            id=model.id,
            hotel_id=model.hotel_id,
            room_number=model.room_number,
            room_type=model.room_type,
            price=model.price,
            position=model.position,
            facilities=facilities,
            is_available=model.is_available,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, room: Room) -> RoomModel:
        """Convert domain entity to SQLAlchemy model"""
        facilities_json = json.dumps(room.facilities) if room.facilities else None
        return RoomModel(
            id=room.id or str(uuid.uuid4()),
            hotel_id=room.hotel_id,
            room_number=room.room_number,
            room_type=room.room_type,
            price=room.price,
            position=room.position,
            facilities=facilities_json,
            is_available=room.is_available,
            created_at=room.created_at or datetime.utcnow(),
            updated_at=room.updated_at or datetime.utcnow()
        )
    
    async def create_room(self, room: Room) -> Room:
        try:
            if not room.id:
                room.id = str(uuid.uuid4())
            if not room.created_at:
                room.created_at = datetime.utcnow()
            if not room.updated_at:
                room.updated_at = datetime.utcnow()
                
            db_room = self._entity_to_model(room)
            self.db.add(db_room)
            await self.db.commit()
            await self.db.refresh(db_room)
            return self._model_to_entity(db_room)
        except Exception as e:
            await self.db.rollback()
            raise e
    
    async def get_room_by_id(self, room_id: str) -> Optional[Room]:
        result = await self.db.execute(
            select(RoomModel).where(RoomModel.id == room_id)
        )
        db_room = result.scalar_one_or_none()
        return self._model_to_entity(db_room) if db_room else None
    
    async def get_rooms_by_hotel_id(self, hotel_id: str) -> List[Room]:
        result = await self.db.execute(
            select(RoomModel).where(RoomModel.hotel_id == hotel_id)
        )
        db_rooms = result.scalars().all()
        return [self._model_to_entity(room) for room in db_rooms]
    
    async def get_rooms(self, skip: int = 0, limit: int = 100) -> List[Room]:
        result = await self.db.execute(
            select(RoomModel).offset(skip).limit(limit)
        )
        db_rooms = result.scalars().all()
        return [self._model_to_entity(room) for room in db_rooms]
    
    async def update_room(self, room: Room) -> Room:
        result = await self.db.execute(
            select(RoomModel).where(RoomModel.id == room.id)
        )
        db_room = result.scalar_one_or_none()
        
        if not db_room:
            raise ValueError(f"Room with id {room.id} not found")
        
        # Update fields
        db_room.hotel_id = room.hotel_id
        db_room.room_number = room.room_number
        db_room.room_type = room.room_type
        db_room.price = room.price
        db_room.position = room.position
        db_room.facilities = json.dumps(room.facilities) if room.facilities else None
        db_room.is_available = room.is_available
        db_room.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(db_room)
        return self._model_to_entity(db_room)
    
    async def delete_room(self, room_id: str) -> bool:
        result = await self.db.execute(
            select(RoomModel).where(RoomModel.id == room_id)
        )
        db_room = result.scalar_one_or_none()
        
        if not db_room:
            return False
        
        await self.db.delete(db_room)
        await self.db.commit()
        return True


class SQLiteRoomImageRepository(RoomImageRepository):
    """SQLite implementation of room image repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: RoomImageModel) -> RoomImage:
        """Convert SQLAlchemy model to domain entity"""
        return RoomImage(
            id=model.id,
            room_id=model.room_id,
            image_url=model.image_url,
            alt_text=model.alt_text,
            display_order=model.display_order,
            created_at=model.created_at
        )
    
    def _entity_to_model(self, image: RoomImage) -> RoomImageModel:
        """Convert domain entity to SQLAlchemy model"""
        return RoomImageModel(
            id=image.id or str(uuid.uuid4()),
            room_id=image.room_id,
            image_url=image.image_url,
            alt_text=image.alt_text,
            display_order=image.display_order,
            created_at=image.created_at or datetime.utcnow()
        )
    
    async def create_room_image(self, image: RoomImage) -> RoomImage:
        try:
            if not image.id:
                image.id = str(uuid.uuid4())
            if not image.created_at:
                image.created_at = datetime.utcnow()
                
            db_image = self._entity_to_model(image)
            self.db.add(db_image)
            await self.db.commit()
            await self.db.refresh(db_image)
            return self._model_to_entity(db_image)
        except Exception as e:
            await self.db.rollback()
            raise e
    
    async def get_room_image_by_id(self, image_id: str) -> Optional[RoomImage]:
        result = await self.db.execute(
            select(RoomImageModel).where(RoomImageModel.id == image_id)
        )
        db_image = result.scalar_one_or_none()
        return self._model_to_entity(db_image) if db_image else None
    
    async def get_images_by_room_id(self, room_id: str) -> List[RoomImage]:
        result = await self.db.execute(
            select(RoomImageModel)
            .where(RoomImageModel.room_id == room_id)
            .order_by(RoomImageModel.display_order)
        )
        db_images = result.scalars().all()
        return [self._model_to_entity(image) for image in db_images]
    
    async def delete_room_image(self, image_id: str) -> bool:
        result = await self.db.execute(
            select(RoomImageModel).where(RoomImageModel.id == image_id)
        )
        db_image = result.scalar_one_or_none()
        
        if not db_image:
            return False
        
        await self.db.delete(db_image)
        await self.db.commit()
        return True


class SQLiteReviewRepository(ReviewRepository):
    """SQLite implementation of review repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: ReviewModel) -> Review:
        """Convert SQLAlchemy model to domain entity"""
        return Review(
            id=model.id,
            room_id=model.room_id,
            user_id=model.user_id,
            rating=model.rating,
            comment=model.comment,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, review: Review) -> ReviewModel:
        """Convert domain entity to SQLAlchemy model"""
        return ReviewModel(
            id=review.id or str(uuid.uuid4()),
            room_id=review.room_id,
            user_id=review.user_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at or datetime.utcnow(),
            updated_at=review.updated_at or datetime.utcnow()
        )
    
    async def create_review(self, review: Review) -> Review:
        try:
            if not review.id:
                review.id = str(uuid.uuid4())
            if not review.created_at:
                review.created_at = datetime.utcnow()
            if not review.updated_at:
                review.updated_at = datetime.utcnow()
                
            db_review = self._entity_to_model(review)
            self.db.add(db_review)
            await self.db.commit()
            await self.db.refresh(db_review)
            return self._model_to_entity(db_review)
        except Exception as e:
            await self.db.rollback()
            raise e
    
    async def get_review_by_id(self, review_id: str) -> Optional[Review]:
        result = await self.db.execute(
            select(ReviewModel).where(ReviewModel.id == review_id)
        )
        db_review = result.scalar_one_or_none()
        return self._model_to_entity(db_review) if db_review else None
    
    async def get_reviews_by_room_id(self, room_id: str) -> List[Review]:
        result = await self.db.execute(
            select(ReviewModel)
            .where(ReviewModel.room_id == room_id)
            .order_by(ReviewModel.created_at.desc())
        )
        db_reviews = result.scalars().all()
        return [self._model_to_entity(review) for review in db_reviews]
    
    async def get_reviews_by_user_id(self, user_id: str) -> List[Review]:
        result = await self.db.execute(
            select(ReviewModel)
            .where(ReviewModel.user_id == user_id)
            .order_by(ReviewModel.created_at.desc())
        )
        db_reviews = result.scalars().all()
        return [self._model_to_entity(review) for review in db_reviews]
    
    async def update_review(self, review: Review) -> Review:
        result = await self.db.execute(
            select(ReviewModel).where(ReviewModel.id == review.id)
        )
        db_review = result.scalar_one_or_none()
        
        if not db_review:
            raise ValueError(f"Review with id {review.id} not found")
        
        # Update fields
        db_review.rating = review.rating
        db_review.comment = review.comment
        db_review.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(db_review)
        return self._model_to_entity(db_review)
    
    async def delete_review(self, review_id: str) -> bool:
        result = await self.db.execute(
            select(ReviewModel).where(ReviewModel.id == review_id)
        )
        db_review = result.scalar_one_or_none()
        
        if not db_review:
            return False
        
        await self.db.delete(db_review)
        await self.db.commit()
        return True


class SQLiteReservationRepository(ReservationRepository):
    """SQLite implementation of reservation repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: ReservationModel) -> Reservation:
        """Convert SQLAlchemy model to domain entity"""
        return Reservation(
            id=model.id,
            room_id=model.room_id,
            client_id=model.client_id,
            client_email=model.client_email,
            client_name=model.client_name,
            employee_id=model.employee_id,
            check_in_date=model.check_in_date,
            check_out_date=model.check_out_date,
            total_price=model.total_price,
            status=ReservationStatus(model.status),
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    async def create_reservation(self, reservation: Reservation) -> Reservation:
        db_reservation = ReservationModel(
            id=str(uuid.uuid4()),
            room_id=reservation.room_id,
            client_id=reservation.client_id,
            client_email=reservation.client_email,
            client_name=reservation.client_name,
            employee_id=reservation.employee_id,
            check_in_date=reservation.check_in_date,
            check_out_date=reservation.check_out_date,
            total_price=reservation.total_price,
            status=reservation.status.value,
            notes=reservation.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.db.add(db_reservation)
        await self.db.commit()
        await self.db.refresh(db_reservation)
        return self._model_to_entity(db_reservation)
    
    async def get_reservation_by_id(self, reservation_id: str) -> Optional[Reservation]:
        result = await self.db.execute(
            select(ReservationModel).where(ReservationModel.id == reservation_id)
        )
        db_reservation = result.scalar_one_or_none()
        return self._model_to_entity(db_reservation) if db_reservation else None
    
    async def get_reservations_by_client_id(self, client_id: str) -> List[Reservation]:
        result = await self.db.execute(
            select(ReservationModel).where(ReservationModel.client_id == client_id)
        )
        db_reservations = result.scalars().all()
        return [self._model_to_entity(r) for r in db_reservations]
    
    async def get_reservations_by_room_id(self, room_id: str) -> List[Reservation]:
        result = await self.db.execute(
            select(ReservationModel).where(ReservationModel.room_id == room_id)
        )
        db_reservations = result.scalars().all()
        return [self._model_to_entity(r) for r in db_reservations]
    
    async def get_reservations(self, skip: int = 0, limit: int = 100) -> List[Reservation]:
        result = await self.db.execute(
            select(ReservationModel).offset(skip).limit(limit)
        )
        db_reservations = result.scalars().all()
        return [self._model_to_entity(r) for r in db_reservations]
    
    async def update_reservation(self, reservation: Reservation) -> Reservation:
        result = await self.db.execute(
            select(ReservationModel).where(ReservationModel.id == reservation.id)
        )
        db_reservation = result.scalar_one_or_none()
        
        if not db_reservation:
            raise ValueError(f"Reservation with id {reservation.id} not found")
        
        # Update fields
        db_reservation.status = reservation.status.value
        db_reservation.notes = reservation.notes
        db_reservation.employee_id = reservation.employee_id
        db_reservation.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(db_reservation)
        return self._model_to_entity(db_reservation)
    
    async def delete_reservation(self, reservation_id: str) -> bool:
        result = await self.db.execute(
            select(ReservationModel).where(ReservationModel.id == reservation_id)
        )
        db_reservation = result.scalar_one_or_none()
        
        if not db_reservation:
            return False
        
        await self.db.delete(db_reservation)
        await self.db.commit()
        return True
    
    async def check_room_availability(self, room_id: str, check_in: datetime, check_out: datetime) -> bool:
        """Check if room is available for given dates"""
        # Check for overlapping reservations
        result = await self.db.execute(
            select(ReservationModel).where(
                ReservationModel.room_id == room_id,
                ReservationModel.status.in_([ReservationStatus.PENDING.value, ReservationStatus.CONFIRMED.value]),
                ReservationModel.check_in_date < check_out,
                ReservationModel.check_out_date > check_in
            )
        )
        overlapping_reservations = result.scalars().all()
        return len(overlapping_reservations) == 0
