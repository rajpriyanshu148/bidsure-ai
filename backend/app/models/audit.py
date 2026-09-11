import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # TENDER_CREATED, DOCUMENT_UPLOADED, OCR_COMPLETED, etc.
    entity_type = Column(String(50), nullable=False)  # Tender, Bidder, Requirement, Document, Decision
    entity_id = Column(String(36), nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
