from typing import List, Optional

from auth import get_current_active_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models import Item, User
from schemas import (
    CategoryStats,
    ItemCreate,
    ItemListResponse,
    ItemResponse,
    ItemStatsResponse,
    ItemUpdate,
)
from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/items", tags=["Items"])


@router.get("/", response_model=ItemListResponse)
def get_items(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search in name/description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: str = Query("created_at", description="Sort by field"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all items with pagination and filtering."""
    query = db.query(Item).filter(Item.owner_id == current_user.id)

    # Apply search filter
    if search:
        query = query.filter(
            Item.name.ilike(f"%{search}%") | Item.description.ilike(f"%{search}%")
        )

    # Apply category filter
    if category:
        query = query.filter(Item.category == category)

    # Apply sorting
    sort_column = getattr(Item, sort_by, Item.created_at)
    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Get total count
    total = query.count()

    # Apply pagination
    items = query.offset(skip).limit(limit).all()

    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/stats", response_model=ItemStatsResponse)
def get_item_stats(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get item statistics."""
    user_items = db.query(Item).filter(Item.owner_id == current_user.id)

    # Total items
    total_items = user_items.count()

    # Total value
    total_value = (
        db.query(func.sum(Item.price * Item.quantity))
        .filter(Item.owner_id == current_user.id)
        .scalar()
        or 0
    )

    # Category statistics
    category_stats = (
        db.query(Item.category, func.count(Item.id).label("count"))
        .filter(Item.owner_id == current_user.id, Item.category.isnot(None))
        .group_by(Item.category)
        .all()
    )

    categories = [
        CategoryStats(name=stat.category or "Uncategorized", count=stat.count)
        for stat in category_stats
    ]

    # Recent items (last 7 days)
    from datetime import datetime, timedelta

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_items = user_items.filter(Item.created_at >= week_ago).count()

    return {
        "total_items": total_items,
        "total_value": total_value,
        "categories": categories,
        "recent_items": recent_items,
    }


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get single item by ID."""
    item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.owner_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    return item


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new item."""
    db_item = Item(**item.dict(), owner_id=current_user.id)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_update: ItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update entire item (replace)."""
    db_item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.owner_id == current_user.id)
        .first()
    )

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    # Update all fields
    for field, value in item_update.dict().items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)

    return db_item


@router.patch("/{item_id}", response_model=ItemResponse)
def partial_update_item(
    item_id: int,
    item_update: ItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Partial update item."""
    db_item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.owner_id == current_user.id)
        .first()
    )

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    # Update only provided fields
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)

    return db_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete item."""
    db_item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.owner_id == current_user.id)
        .first()
    )

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    db.delete(db_item)
    db.commit()

    return None
