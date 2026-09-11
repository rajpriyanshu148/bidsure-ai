from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TenderRequirementBase(BaseModel):
    rule_type: str
    description: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    expected_text: Optional[str] = None
    currency: str = "INR"
    weight: float = 10.0
    mandatory: bool = True
    is_critical: bool = False


class TenderRequirementCreate(TenderRequirementBase):
    pass


class TenderRequirementUpdate(BaseModel):
    description: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    expected_text: Optional[str] = None
    weight: Optional[float] = None
    mandatory: Optional[bool] = None
    is_critical: Optional[bool] = None


class TenderRequirementResponse(TenderRequirementBase):
    id: str
    tender_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TenderBase(BaseModel):
    tender_number: str
    title: str
    description: Optional[str] = None
    category: str = "Goods"
    estimated_value: float = 0.0
    closing_date: Optional[datetime] = None


class TenderCreate(TenderBase):
    requirements: Optional[List[TenderRequirementCreate]] = []


class TenderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    estimated_value: Optional[float] = None
    status: Optional[str] = None
    closing_date: Optional[datetime] = None


class TenderResponse(TenderBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    bidders_count: Optional[int] = 0
    average_score: Optional[float] = 0.0

    class Config:
        from_attributes = True


class TenderDetailResponse(TenderResponse):
    requirements: List[TenderRequirementResponse] = []
