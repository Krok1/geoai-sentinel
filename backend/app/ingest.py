# backend/app/ingest.py
from fastapi import APIRouter
from .db import engine, events
import json

router = APIRouter()

@router.post("/ingest")
async def ingest_event(payload: dict):
    """
    payload: { source, type, summary, lat, lon, properties(optional) }
    """
    ins = events.insert().values(
        source=payload.get("source"),
        type=payload.get("type"),
        summary=payload.get("summary"),
        lat=payload.get("lat"),
        lon=payload.get("lon"),
        properties=payload.get("properties", {})
    )
    conn = engine.connect()
    result = conn.execute(ins)
    conn.close()
    return {"status": "ok", "id": result.inserted_primary_key}
