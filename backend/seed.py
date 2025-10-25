"""
Seed script to populate the database with sample data.
Usage: python seed.py
"""

import sys
from decimal import Decimal

from auth import get_password_hash
from database import Base, engine, get_db
from models import Item, User
from sqlalchemy.orm import Session


def create_sample_user(db: Session) -> User:
    """Create a sample user with username and password as 'test'."""

    # Check if user already exists
    existing_user = db.query(User).filter(User.username == "test").first()
    if existing_user:
        print("✓ User 'test' already exists")
        return existing_user

    user = User(
        email="test@example.com",
        username="test",
        full_name="Test User",
        hashed_password=get_password_hash("test"),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print("✓ Created user:")
    print(f"  Username: test")
    print(f"  Password: test")
    print(f"  Email: test@example.com")

    return user


def create_sample_items(db: Session, user: User):
    """Create sample items for the user."""

    # Check if items already exist for this user
    existing_items_count = db.query(Item).filter(Item.owner_id == user.id).count()
    if existing_items_count > 0:
        print(f"✓ User already has {existing_items_count} items")
        return

    sample_items = [
        {
            "name": "Laptop",
            "description": "High-performance laptop for development",
            "category": "Electronics",
            "price": Decimal("1299.99"),
            "quantity": 5,
            "is_active": True,
        },
        {
            "name": "Wireless Mouse",
            "description": "Ergonomic wireless mouse with 6 buttons",
            "category": "Electronics",
            "price": Decimal("29.99"),
            "quantity": 15,
            "is_active": True,
        },
        {
            "name": "Mechanical Keyboard",
            "description": "RGB mechanical keyboard with Cherry MX switches",
            "category": "Electronics",
            "price": Decimal("149.99"),
            "quantity": 8,
            "is_active": True,
        },
        {
            "name": "USB-C Hub",
            "description": "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
            "category": "Accessories",
            "price": Decimal("49.99"),
            "quantity": 20,
            "is_active": True,
        },
        {
            "name": "Desk Lamp",
            "description": "LED desk lamp with adjustable brightness",
            "category": "Furniture",
            "price": Decimal("35.00"),
            "quantity": 12,
            "is_active": True,
        },
        {
            "name": "Office Chair",
            "description": "Ergonomic office chair with lumbar support",
            "category": "Furniture",
            "price": Decimal("299.99"),
            "quantity": 3,
            "is_active": True,
        },
        {
            "name": "Monitor Stand",
            "description": "Adjustable monitor stand with storage drawer",
            "category": "Accessories",
            "price": Decimal("45.00"),
            "quantity": 10,
            "is_active": True,
        },
        {
            "name": "Webcam",
            "description": "1080p HD webcam with built-in microphone",
            "category": "Electronics",
            "price": Decimal("89.99"),
            "quantity": 7,
            "is_active": True,
        },
        {
            "name": "Headphones",
            "description": "Noise-cancelling wireless headphones",
            "category": "Electronics",
            "price": Decimal("199.99"),
            "quantity": 6,
            "is_active": True,
        },
        {
            "name": "Notebook Set",
            "description": "Set of 3 premium notebooks",
            "category": "Stationery",
            "price": Decimal("15.99"),
            "quantity": 25,
            "is_active": True,
        },
        {
            "name": "Pen Set",
            "description": "Professional gel pen set - 12 colors",
            "category": "Stationery",
            "price": Decimal("12.50"),
            "quantity": 30,
            "is_active": True,
        },
        {
            "name": "Desk Organizer",
            "description": "Wooden desk organizer with multiple compartments",
            "category": "Accessories",
            "price": Decimal("25.00"),
            "quantity": 15,
            "is_active": True,
        },
        {
            "name": "External SSD",
            "description": "1TB external SSD with USB 3.2 Gen 2",
            "category": "Electronics",
            "price": Decimal("129.99"),
            "quantity": 4,
            "is_active": True,
        },
        {
            "name": "Cable Management Kit",
            "description": "Complete cable management solution",
            "category": "Accessories",
            "price": Decimal("19.99"),
            "quantity": 18,
            "is_active": True,
        },
        {
            "name": "Phone Stand",
            "description": "Adjustable aluminum phone stand",
            "category": "Accessories",
            "price": Decimal("14.99"),
            "quantity": 22,
            "is_active": True,
        },
    ]

    items_created = 0
    for item_data in sample_items:
        item = Item(**item_data, owner_id=user.id)
        db.add(item)
        items_created += 1

    db.commit()
    print(f"✓ Created {items_created} sample items")


def seed_database():
    """Main function to seed the database."""
    print("\n🌱 Starting database seeding...\n")

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables ready\n")

    # Get database session
    db = next(get_db())

    try:
        # Create sample user
        user = create_sample_user(db)
        print()

        # Create sample items
        create_sample_items(db, user)
        print()

        print("✅ Database seeding completed successfully!\n")
        print("You can now login with:")
        print("  Username: test")
        print("  Password: test\n")

    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}\n")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
