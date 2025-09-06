from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import os
from .database import engine
from .models import Base
from .products import router as products_router
from .cart_orders import router as cart_orders_router
from .auth import router as auth_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoFinds API",
    description="API for EcoFinds eco-friendly marketplace",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products_router)
app.include_router(cart_orders_router)
app.include_router(auth_router)

@app.get("/health")
def health_check():
    """Check if the API is running."""
    return {"status": "ok"}

