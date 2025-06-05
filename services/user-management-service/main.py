from fastapi import FastAPI
from interfaces.api.user_router import router as user_router
from interfaces.api.admin_router import router as admin_router
from infrastructure.database import Database
import asyncio

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="User Management Service",
    description="User management microservice for hotel chain application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/v1/users", tags=["users"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    database = Database()
    await database.init_db()

@app.get("/")
async def root():
    return {"message": "User Management Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
