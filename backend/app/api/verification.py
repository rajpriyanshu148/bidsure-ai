from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.integrations.mock_government import GOVERNMENT_PROVIDERS, get_government_provider

router = APIRouter(prefix="/verification", tags=["Government Verification"])


class SimulateQuery(BaseModel):
    source: str  # e.g. MOCK_GSTN, MOCK_CBDT_PAN, MOCK_UDYAM, MOCK_BLACKLISTING, etc.
    query_param: str


@router.get("/sources")
def list_supported_sources():
    return [
        {
            "source": name,
            "description": provider.description,
            "is_simulated": True,
        }
        for name, provider in GOVERNMENT_PROVIDERS.items()
    ]


@router.post("/simulate")
def simulate_verification(query: SimulateQuery) -> Dict[str, Any]:
    provider = get_government_provider(query.source)
    if not provider:
        raise HTTPException(status_code=400, detail=f"Unsupported verification source '{query.source}'")

    res = provider.verify(query.query_param)
    return {
        "status": "success",
        "source": query.source,
        "query_param": query.query_param,
        "is_simulated": True,
        "data": res,
    }
