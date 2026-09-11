from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime


class GovVerificationQuery(BaseModel):
    source: str
    query_param: str


class GovVerificationResponse(BaseModel):
    id: str
    bidder_id: str
    source: str
    query_param: str
    status: str
    raw_response: Dict[str, Any]
    is_simulated: bool
    verified_at: datetime

    class Config:
        from_attributes = True
