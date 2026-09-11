import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class DocumentType(str, Enum):
    GST_CERTIFICATE = "GST_CERTIFICATE"
    GST_RETURN = "GST_RETURN"
    PAN_CARD = "PAN_CARD"
    ITR = "ITR"
    BALANCE_SHEET = "BALANCE_SHEET"
    UDYAM_CERTIFICATE = "UDYAM_CERTIFICATE"
    OEM_AUTHORIZATION = "OEM_AUTHORIZATION"
    MAKE_IN_INDIA = "MAKE_IN_INDIA"
    TURNOVER_CERTIFICATE = "TURNOVER_CERTIFICATE"
    STARTUP_INDIA = "STARTUP_INDIA"
    NSIC_CERTIFICATE = "NSIC_CERTIFICATE"
    EPFO_CERTIFICATE = "EPFO_CERTIFICATE"
    ESIC_CERTIFICATE = "ESIC_CERTIFICATE"
    DIGILOCKER_DOCUMENT = "DIGILOCKER_DOCUMENT"
    BLACKLISTING_AFFIDAVIT = "BLACKLISTING_AFFIDAVIT"
    DEBARMENT_AFFIDAVIT = "DEBARMENT_AFFIDAVIT"
    TENDER_DOCUMENT = "TENDER_DOCUMENT"
    OTHER = "OTHER"


class OCRStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=True)
    tender_id = Column(String(36), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=True)
    document_type = Column(String(50), default=DocumentType.OTHER.value, nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    total_pages = Column(Integer, default=1)
    ocr_status = Column(String(30), default=OCRStatus.PENDING.value, nullable=False)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    bidder = relationship("Bidder", back_populates="documents")
    tender = relationship("Tender", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    extracted_entities = relationship("ExtractedEntity", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=True)
    has_images = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("Document", back_populates="pages")


class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    bidder_id = Column(String(36), ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # TURNOVER, GSTIN, PAN, COMPANY_NAME, EXPIRY_DATE, LOCAL_CONTENT_PCT, etc.
    raw_value = Column(String(500), nullable=False)
    normalized_value = Column(String(500), nullable=True)
    confidence = Column(Float, default=0.90)  # 0.0 to 1.0
    page_number = Column(Integer, default=1)
    bounding_box = Column(JSON, nullable=True)  # optional coordinates
    is_manually_edited = Column(Boolean, default=False)
    original_ai_value = Column(String(500), nullable=True)
    edited_by = Column(String(255), nullable=True)
    edit_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    document = relationship("Document", back_populates="extracted_entities")
    bidder = relationship("Bidder", back_populates="extracted_entities")