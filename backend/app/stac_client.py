# backend/app/stac_client.py
import os
import httpx

STAC_API = os.getenv("STAC_API", "https://planetarycomputer.microsoft.com/api/stac/v1")

async def stac_search_bbox(bbox, collection="sentinel-2-l2a-cogs", limit=10):
    url = f"{STAC_API}/search"
    payload = {
        "bbox": bbox,
        "collections": [collection],
        "limit": limit,
        "sort": [{"field":"properties.datetime","direction":"desc"}]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        return r.json()
