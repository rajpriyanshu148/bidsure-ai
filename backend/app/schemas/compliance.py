from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ComplianceResultResponse(BaseModel):
    id: str
    bidder_id: str
    requirement_id: Optional[str] = None
    rule_name: str
    status: str
    score: float
    confidence: float
    reason: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    difference: Optional[str] = None
    evidence_document_id: Optional[str] = None
    evidence_page_number: Optional[str] = None
    evidence_snippet: Optional[str] = None
    rule_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RiskScoreResponse(BaseModel):
    id: str
    bidder_id: str
    numerical_score: float
    risk_level: str
    critical_override_applied: bool
    override_reason: Optional[str] = None
    breakdown: Optional[Dict[str, Any]] = None
    calculated_at: datetime

    class Config:
        from_attributes = True


class AIRecommendationResponse(BaseModel):
    id: str
    bidder_id: str
    overall_assessment: str
    key_issues: Optional[List[str]] = []
    positive_checks: Optional[List[str]] = []
    recommendation_text: str
    advisory_disclaimer: str
    generated_at: datetime

    class Config:
        from_attributes = True


class ComplianceSummaryResponse(BaseModel):
    bidder_id: str
    company_name: str
    tender_number: str
    compliance_score: float
    risk_level: str
    status_counts: Dict[str, int]
    compliance_results: List[ComplianceResultResponse]
    risk_details: Optional[RiskScoreResponse] = None
    recommendation: Optional[AIRecommendationResponse] = None
