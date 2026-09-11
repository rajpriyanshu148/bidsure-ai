from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.tender import TenderResponse
from app.schemas.bidder import BidderResponse


class DashboardStatsResponse(BaseModel):
    total_tenders: int
    active_tenders: int
    total_bidders: int
    bidders_under_review: int
    average_compliance_score: float
    high_risk_bidders: int
    compliance_distribution: Dict[str, int]  # low, medium, high
    status_distribution: Dict[str, int]  # PASS, WARNING, FAIL, MISSING
    recent_tenders: List[TenderResponse]
    high_risk_bidder_list: List[BidderResponse]
