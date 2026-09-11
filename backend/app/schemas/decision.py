from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OfficerDecisionCreate(BaseModel):
    decision: str  # APPROVED, REJECTED, CLARIFICATION_REQUESTED, UNDER_REVIEW
    justification_remarks: str
    officer_name: str
    disclaimer_acknowledged: bool = True


class OfficerDecisionResponse(BaseModel):
    id: str
    bidder_id: str
    officer_id: Optional[str] = None
    officer_name: str
    decision: str
    justification_remarks: str
    disclaimer_acknowledged: bool
    decided_at: datetime

    class Config:
        from_attributes = True
