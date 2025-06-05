from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import os

# Database URL - SQLite with async support
DATABASE_URL = "sqlite+aiosqlite:///./hotel_service.db"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


class HotelModel(Base):
    """SQLAlchemy Hotel model"""
    __tablename__ = "hotels"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    address = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amenities = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rooms = relationship("RoomModel", back_populates="hotel", cascade="all, delete-orphan")


class RoomModel(Base):
    """SQLAlchemy Room model"""
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, index=True)
    hotel_id = Column(String, ForeignKey("hotels.id"), nullable=False)
    room_number = Column(String, nullable=False)
    room_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    position = Column(String, nullable=True)
    facilities = Column(Text, nullable=True)  # JSON string
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hotel = relationship("HotelModel", back_populates="rooms")
    images = relationship("RoomImageModel", back_populates="room", cascade="all, delete-orphan")
    reviews = relationship("ReviewModel", back_populates="room", cascade="all, delete-orphan")
    reservations = relationship("ReservationModel", back_populates="room", cascade="all, delete-orphan")
    reservations = relationship("ReservationModel", back_populates="room", cascade="all, delete-orphan")


class RoomImageModel(Base):
    """SQLAlchemy Room Image model"""
    __tablename__ = "room_images"
    
    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    image_url = Column(String, nullable=False)
    alt_text = Column(String, nullable=True)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    room = relationship("RoomModel", back_populates="images")


class ReviewModel(Base):
    """SQLAlchemy Review model"""
    __tablename__ = "reviews"
    
    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, nullable=False)  # Reference to user service
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    room = relationship("RoomModel", back_populates="reviews")


class ReservationModel(Base):
    """SQLAlchemy Reservation model"""
    __tablename__ = "reservations"
    
    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    client_id = Column(String, nullable=False)  # Reference to user service
    client_email = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    employee_id = Column(String, nullable=True)  # Employee who processed
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    room = relationship("RoomModel", back_populates="reservations")


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Create tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
