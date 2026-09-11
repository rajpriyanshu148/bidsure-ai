import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TenderStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    EVALUATION = "EVALUATION"
    CLOSED = "CLOSED"


class RequirementType(str, Enum):
    TURNOVER = "TURNOVER"
    GST = "GST"
    PAN = "PAN"
    UDYAM = "UDYAM"
    OEM_AUTHORIZATION = "OEM_AUTHORIZATION"
    LOCAL_CONTENT = "LOCAL_CONTENT"
    BLACKLISTING = "BLACKLISTING"
    EXPIRY = "EXPIRY"
    ITR = "ITR"
    EPFO = "EPFO"
    ESIC = "ESIC"
    STARTUP_INDIA = "STARTUP_INDIA"
    NSIC = "NSIC"
    ENTITY_CONSISTENCY = "ENTITY_CONSISTENCY"
    CUSTOM = "CUSTOM"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Goods", nullable=False)
    estimated_value = Column(Float, default=0.0)
    closing_date = Column(DateTime, nullable=True)
    status = Column(String(50), default=TenderStatus.ACTIVE.value, nullable=False)
    created_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    requirements = relationship("TenderRequirement", back_populates="tender", cascade="all, delete-orphan")
    bidders = relationship("Bidder", back_populates="tender", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="tender")


class TenderRequirement(Base):
    __tablename__ = "requirements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(36), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False)
    rule_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    expected_text = Column(String(255), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    weight = Column(Float, default=10.0, nullable=False)  # Weight percentage e.g. 15.0
    mandatory = Column(Boolean, default=True, nullable=False)
    is_critical = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    tender = relationship("Tender", back_populates="requirements")
    compliance_results = relationship("ComplianceResult", back_populates="requirement", cascade="all, delete-orphan")
