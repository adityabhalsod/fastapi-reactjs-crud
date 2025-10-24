from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from database import get_db
from models import User
from schemas import (
    UserCreate, UserResponse, UserLogin, TokenResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_user_by_email, get_user_by_username, generate_reset_token,
    get_current_active_user
)
from sanitize import sanitize_input, validate_email, validate_username

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def signup(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Sanitize and validate inputs
    email = sanitize_input(user.email.lower())
    username = sanitize_input(user.username)
    full_name = sanitize_input(user.full_name) if user.full_name else None
    
    # Validate email format
    if not validate_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate username format
    if not validate_username(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens"
        )
    
    # Check if email already exists
    if get_user_by_email(db, email=email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if get_user_by_username(db, username=username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user




@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, user_login: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    # Sanitize inputs
    username = sanitize_input(user_login.username)
    
    user = authenticate_user(db, username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate password reset token."""
    user = get_user_by_email(db, email=request.email)
    if not user:
        # For security, don't reveal if email exists
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="If the email exists, a reset token has been generated"
        )
    
    # Generate reset token
    reset_token = generate_reset_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    
    return {
        "message": "Password reset token generated",
        "reset_token": reset_token,  # In production, send via email
        "expires_in": 3600
    }


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token."""
    user = db.query(User).filter(User.reset_token == request.reset_token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password and clear reset token
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    
    return {"message": "Password successfully reset"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user