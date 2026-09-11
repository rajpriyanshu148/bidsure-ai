from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class BidderBase(BaseModel):
    company_name: str
    cin: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None
    udyam_number: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class BidderCreate(BidderBase):
    tender_id: str


class BidderResponse(BidderBase):
    id: str
    tender_id: str
    submitted_at: datetime
    compliance_score: float
    risk_level: str
    verification_status: str
    officer_decision_status: str

    class Config:
        from_attributes = True


class BidderDetailResponse(BidderResponse):
    documents_count: int = 0
    passed_requirements: int = 0
    failed_requirements: int = 0
    warning_requirements: int = 0
    missing_requirements: int = 0


class RegisterAndBidRequest(BaseModel):
    tender_id: str
    company_name: str
    cin: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None
    udyam_number: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    turnover_cr: Optional[float] = 25.0
    has_oem_auth: Optional[bool] = True
    local_content_pct: Optional[float] = 65.0
    quoted_price: Optional[float] = None

