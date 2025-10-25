import os

from database import Base, engine
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, items
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/day", "50/hour"])

# Initialize FastAPI app
app = FastAPI(
    title="CRUD Application API",
    description="A complete CRUD application with authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response


# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(items.router)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Welcome to the CRUD Application API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "API is running successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
