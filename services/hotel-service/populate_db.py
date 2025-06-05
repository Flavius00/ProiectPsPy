#!/usr/bin/env python3
"""
Hotel Service Database Population Script
Populates the hotel-service database with test hotels, rooms, reviews, and reservations
"""
import sys
import os
import asyncio
import uuid
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from infrastructure.database import (
    create_tables, AsyncSessionLocal, 
    HotelModel, RoomModel, RoomImageModel, ReviewModel, ReservationModel
)
from domain.entities import ReservationStatus

# Sample data
HOTEL_LOCATIONS = ["New York", "Los Angeles", "Miami", "Chicago", "Las Vegas"]
ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Executive Suite", "Penthouse"]
ROOM_POSITIONS = ["City View", "Garden View", "Ocean View", "Mountain View", "Pool View"]
AMENITIES = {
    "wifi": True,
    "parking": True,
    "breakfast": True,
    "pool": True,
    "gym": True,
    "spa": False,
    "restaurant": True,
    "bar": True,
    "room_service": True,
    "conference_room": False
}
FACILITIES = {
    "king_bed": True,
    "twin_beds": False,
    "sofa": True,
    "balcony": True,
    "mini_bar": True,
    "coffee_machine": True,
    "safe": True,
    "desk": True,
    "bathtub": False,
    "shower": True
}
IMAGE_URLS = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8",
    "https://images.unsplash.com/photo-1564078516093-cf04bd966897",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
    "https://images.unsplash.com/photo-1595576508898-0ad5c879a061"
]

async def populate_hotel_db():
    """Populate hotel database with test data"""
    print("Creating tables...")
    await create_tables()
    
    async with AsyncSessionLocal() as session:
        # Create hotels
        hotels = []
        for i in range(5):
            hotel_id = str(uuid.uuid4())
            location = HOTEL_LOCATIONS[i % len(HOTEL_LOCATIONS)]
            amenities_subset = {k: v for k, v in AMENITIES.items() if random.choice([True, True, True, False])}
            
            hotel = HotelModel(
                id=hotel_id,
                name=f"Hotel {location} {i+1}",
                location=location,
                address=f"{random.randint(100, 999)} Main Street, {location}",
                description=f"A beautiful hotel in {location}. Perfect for your stay!",
                amenities=json.dumps(amenities_subset),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            hotels.append(hotel)
            session.add(hotel)
            print(f"Adding hotel: {hotel.name}")
        
        # Save hotels to get IDs
        await session.commit()
        
        # Create rooms for each hotel
        rooms = []
        for hotel in hotels:
            for i in range(random.randint(5, 10)):
                room_id = str(uuid.uuid4())
                room_type = random.choice(ROOM_TYPES)
                position = random.choice(ROOM_POSITIONS)
                price = round(random.uniform(100, 500), 2)
                facilities_subset = {k: v for k, v in FACILITIES.items() if random.choice([True, True, True, False])}
                
                room = RoomModel(
                    id=room_id,
                    hotel_id=hotel.id,
                    room_number=str(100 + i),
                    room_type=room_type,
                    price=price,
                    position=position,
                    facilities=json.dumps(facilities_subset),
                    is_available=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                rooms.append(room)
                session.add(room)
                print(f"Adding room: {room.room_number} ({room_type}) to {hotel.name}")
                
                # Add 1-3 images per room
                for j in range(random.randint(1, 3)):
                    image = RoomImageModel(
                        id=str(uuid.uuid4()),
                        room_id=room_id,
                        image_url=random.choice(IMAGE_URLS),
                        alt_text=f"{room_type} {position} image {j+1}",
                        display_order=j+1,
                        created_at=datetime.utcnow()
                    )
                    session.add(image)
        
        # Save rooms to get IDs
        await session.commit()
        
        # Create reviews for some rooms
        client_ids = ["client1-uuid", "client2-uuid", "client3-uuid", "client4-uuid"]
        client_names = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown"]
        
        for room in rooms:
            # 50% chance to have reviews
            if random.choice([True, False]):
                num_reviews = random.randint(1, 5)
                for i in range(num_reviews):
                    client_idx = random.randint(0, len(client_ids)-1)
                    review = ReviewModel(
                        id=str(uuid.uuid4()),
                        room_id=room.id,
                        user_id=client_ids[client_idx],
                        rating=random.randint(3, 5),  # Mostly positive reviews
                        comment=f"This room was {'amazing' if random.choice([True, False]) else 'great'}! {'Would definitely stay again.' if random.choice([True, False]) else 'Very comfortable.'}",
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                        updated_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
                    )
                    session.add(review)
                    print(f"Adding review for room {room.room_number} in {room.hotel_id}")
        
        # Save reviews
        await session.commit()
        
        # Create reservations for some rooms
        for room in rooms:
            # 30% chance to have reservations
            if random.random() < 0.3:
                num_reservations = random.randint(1, 3)
                for i in range(num_reservations):
                    # Past reservation (completed)
                    if i == 0:
                        check_in = datetime.now() - timedelta(days=random.randint(30, 60))
                        check_out = check_in + timedelta(days=random.randint(1, 7))
                        status = ReservationStatus.COMPLETED.value
                    # Current reservation (confirmed)
                    elif i == 1:
                        check_in = datetime.now() - timedelta(days=random.randint(1, 3))
                        check_out = datetime.now() + timedelta(days=random.randint(1, 4))
                        status = ReservationStatus.CONFIRMED.value
                    # Future reservation (confirmed)
                    else:
                        check_in = datetime.now() + timedelta(days=random.randint(7, 30))
                        check_out = check_in + timedelta(days=random.randint(1, 14))
                        status = ReservationStatus.CONFIRMED.value
                    
                    client_idx = random.randint(0, len(client_ids)-1)
                    nights = (check_out - check_in).days
                    reservation = ReservationModel(
                        id=str(uuid.uuid4()),
                        room_id=room.id,
                        client_id=client_ids[client_idx],
                        client_email=f"client{client_idx+1}@example.com",
                        client_name=client_names[client_idx],
                        employee_id="employee-uuid" if random.choice([True, False]) else None,
                        check_in_date=check_in,
                        check_out_date=check_out,
                        total_price=room.price * nights,
                        status=status,
                        notes="Special request: Late check-out" if random.choice([True, False]) else None,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
                        updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                    )
                    session.add(reservation)
                    print(f"Adding reservation for room {room.room_number} ({check_in.date()} to {check_out.date()})")
        
        # Save reservations
        await session.commit()
    
    print("Hotel database populated successfully!")

if __name__ == "__main__":
    asyncio.run(populate_hotel_db())
