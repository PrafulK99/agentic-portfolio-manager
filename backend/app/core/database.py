"""
Database configuration and session management using SQLAlchemy.

This module sets up the database engine, session factory, and base declarative
class for all ORM models.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

# Load environment variables from .env file
load_dotenv()

# Load database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Validate that DATABASE_URL is set
if DATABASE_URL is None:
    raise ValueError(
        "DATABASE_URL is not set. Please check your .env file and ensure "
        "DATABASE_URL environment variable is configured."
    )

print("Using DATABASE_URL:", DATABASE_URL)

# Determine if we're using SQLite (for development) or another database
is_sqlite = DATABASE_URL.startswith("sqlite")

# Configure engine based on database type
if is_sqlite:
    # SQLite configuration for development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=NullPool,  # SQLite doesn't support connection pooling
        echo=False,  # Set to True for SQL query logging
    )
else:
    # Production database configuration (PostgreSQL, MySQL, etc.)
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using them
        pool_recycle=3600,   # Recycle connections after 1 hour
        echo=False,  # Set to True for SQL query logging
    )

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base for all models
Base = declarative_base()

# Import all models here to ensure they are registered with Base
# This MUST happen before create_all() is called
from app.models.portfolio import Portfolio  # noqa: F401, E402


def get_db() -> Generator:
    """
    Dependency for FastAPI to get database session.
    
    Yields:
        Database session
    
    Example:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """
    Create all database tables based on the ORM models.
    
    This function creates all tables defined in the Base metadata.
    It's idempotent - calling it multiple times is safe as it only
    creates tables that don't already exist in the database.
    
    Note:
        This should be called once on application startup.
    """
    Base.metadata.create_all(bind=engine)
