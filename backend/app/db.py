# backend/app/db.py
import os
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend_data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
metadata = MetaData()

events = Table(
    "events",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("source", String),
    Column("type", String),
    Column("summary", String),
    Column("lat", Float),
    Column("lon", Float),
    Column("properties", JSON),
    Column("created_at", DateTime, server_default=func.now()),
)

metadata.create_all(engine)
