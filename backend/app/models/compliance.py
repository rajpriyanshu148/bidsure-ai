import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class RuleStatus(str, Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    FAIL = "FAIL"
    MISSING = "MISSING"
    EXPIRED = "EXPIRED"
    INCONSISTENT = "INCONSISTENT"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(String(36), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=True)
    rule_name = Column(String(100), nullable=False)
    status = Column(String(50), default=RuleStatus.REVIEW_REQUIRED.value, nullable=False)
    score = Column(Float, default=0.0)  # 1.0 for PASS, 0.5 for WARNING, 0.0 for FAIL/MISSING
    confidence = Column(Float, default=0.95)
    reason = Column(Text, nullable=False)
    expected_value = Column(String(255), nullable=True)
    actual_value = Column(String(255), nullable=True)
    difference = Column(String(255), nullable=True)
    evidence_document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    evidence_page_number = Column(String(50), nullable=True)
    evidence_snippet = Column(Text, nullable=True)
    rule_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="compliance_results")
    requirement = relationship("TenderRequirement", back_populates="compliance_results")
    evidence_document = relationship("Document")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    numerical_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    critical_override_applied = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    breakdown = Column(JSON, nullable=True)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="risk_scores")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    overall_assessment = Column(String(50), nullable=False)  # HIGH RISK, MEDIUM RISK, LOW RISK
    key_issues = Column(JSON, nullable=True)  # List of strings
    positive_checks = Column(JSON, nullable=True)  # List of strings
    recommendation_text = Column(Text, nullable=False)
    advisory_disclaimer = Column(
        Text,
        default=(
            "AI output is strictly advisory. The final procurement decision is made "
            "exclusively by the authorized Procurement Officer."
        ),
        nullable=False,
    )
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="ai_recommendations")


class OfficerDecision(Base):
    __tablename__ = "officer_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    officer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    officer_name = Column(String(255), nullable=False)
    decision = Column(String(50), nullable=False)  # APPROVED, REJECTED, CLARIFICATION_REQUESTED, UNDER_REVIEW
    justification_remarks = Column(Text, nullable=False)
    disclaimer_acknowledged = Column(Boolean, default=True, nullable=False)
    decided_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="officer_decisions")
    officer = relationship("User")
