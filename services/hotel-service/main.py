import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from interfaces.api.hotel_router import router as hotel_router
from interfaces.api.client_router import router as client_router
from interfaces.api.client_reservation_routes import router as client_reservation_router
from interfaces.api.employee_reservation_routes import router as employee_reservation_router
from infrastructure.database import create_tables

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Hotel Service",
    description="Hotel management microservice for hotel chain application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hotel_router, prefix="/api/v1", tags=["admin"])
app.include_router(client_router, prefix="/api/v1", tags=["client"])
app.include_router(client_reservation_router, prefix="/api/v1")
app.include_router(employee_reservation_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await create_tables()

@app.get("/")
async def root():
    return {"message": "Hotel Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
