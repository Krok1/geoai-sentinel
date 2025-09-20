# backend/app/main.py
from fastapi import FastAPI, Query
from .stac_client import stac_search_bbox
from .ingest import router as ingest_router
from .classifier import classify_text
from .db import engine, events
import os

app = FastAPI(title="GeoAI Sentinel Backend (simple)")

app.include_router(ingest_router, prefix="/api")

@app.get("/api/stac/search")
async def stac_search(lon_min: float, lat_min: float, lon_max: float, lat_max: float, limit: int = 8):
    bbox = [lon_min, lat_min, lon_max, lat_max]
    res = await stac_search_bbox(bbox=bbox, limit=limit)
    # normalize features => compact items
    items = []
    for f in res.get("features", []):
        props = f.get("properties", {})
        items.append({
            "id": f.get("id"),
            "datetime": props.get("datetime"),
            "cloud_cover": props.get("eo:cloud_cover"),
            "bbox": f.get("bbox"),
            "assets": list(f.get("assets", {}).keys())
        })
    return {"items": items}

@app.post("/api/classify")
async def classify(payload: dict):
    text = payload.get("text", "")
    return classify_text(text)

@app.get("/api/events")
def list_events():
    conn = engine.connect()
    rows = conn.execute(events.select().order_by(events.c.created_at.desc()).limit(200)).fetchall()
    conn.close()
    return {"events": [dict(r) for r in rows]}
