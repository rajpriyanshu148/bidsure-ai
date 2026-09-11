import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"


class OfficerDecisionStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CLARIFICATION_REQUESTED = "CLARIFICATION_REQUESTED"
    UNDER_REVIEW = "UNDER_REVIEW"


class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(36), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(255), nullable=False)
    cin = Column(String(50), nullable=True)
    pan = Column(String(20), nullable=True)
    gstin = Column(String(30), nullable=True)
    udyam_number = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    compliance_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default=RiskLevel.LOW.value, nullable=False)
    verification_status = Column(String(30), default=VerificationStatus.PENDING.value, nullable=False)
    officer_decision_status = Column(String(50), default=OfficerDecisionStatus.PENDING.value, nullable=False)

    tender = relationship("Tender", back_populates="bidders")
    documents = relationship("Document", back_populates="bidder", cascade="all, delete-orphan")
    extracted_entities = relationship("ExtractedEntity", back_populates="bidder", cascade="all, delete-orphan")
    government_verifications = relationship("GovernmentVerification", back_populates="bidder", cascade="all, delete-orphan")
    compliance_results = relationship("ComplianceResult", back_populates="bidder", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="bidder", cascade="all, delete-orphan")
    ai_recommendations = relationship("AIRecommendation", back_populates="bidder", cascade="all, delete-orphan")
    officer_decisions = relationship("OfficerDecision", back_populates="bidder", cascade="all, delete-orphan")
