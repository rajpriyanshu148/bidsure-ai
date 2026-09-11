import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class VerificationSource(str, Enum):
    MOCK_GSTN = "MOCK_GSTN"
    MOCK_CBDT_PAN = "MOCK_CBDT_PAN"
    MOCK_UDYAM = "MOCK_UDYAM"
    MOCK_INCOME_TAX = "MOCK_INCOME_TAX"
    MOCK_MCA = "MOCK_MCA"
    MOCK_STARTUP_INDIA = "MOCK_STARTUP_INDIA"
    MOCK_NSIC = "MOCK_NSIC"
    MOCK_EPFO = "MOCK_EPFO"
    MOCK_ESIC = "MOCK_ESIC"
    MOCK_DIGILOCKER = "MOCK_DIGILOCKER"
    MOCK_BLACKLISTING = "MOCK_BLACKLISTING"
    MOCK_MAKE_IN_INDIA = "MOCK_MAKE_IN_INDIA"


class VerificationStatus(str, Enum):
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    FAILED = "FAILED"
    NOT_FOUND = "NOT_FOUND"


class GovernmentVerification(Base):
    __tablename__ = "government_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(50), nullable=False)
    query_param = Column(String(255), nullable=False)
    status = Column(String(50), default=VerificationStatus.SUCCESS.value, nullable=False)
    raw_response = Column(JSON, nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)  # Explicitly denotes mock
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="government_verifications")
