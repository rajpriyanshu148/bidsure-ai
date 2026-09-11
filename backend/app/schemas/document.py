from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class DocumentPageResponse(BaseModel):
    id: str
    page_number: int
    text_content: Optional[str] = None
    has_images: bool = False

    class Config:
        from_attributes = True


class ExtractedEntityResponse(BaseModel):
    id: str
    document_id: Optional[str] = None
    bidder_id: str
    entity_type: str
    raw_value: str
    normalized_value: Optional[str] = None
    confidence: float
    page_number: int
    is_manually_edited: bool
    original_ai_value: Optional[str] = None
    edited_by: Optional[str] = None
    edit_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EntityCorrectionRequest(BaseModel):
    new_value: str
    reason: str


class DocumentResponse(BaseModel):
    id: str
    bidder_id: Optional[str] = None
    tender_id: Optional[str] = None
    document_type: str
    original_filename: str
    file_size: int
    mime_type: str
    total_pages: int
    ocr_status: str
    created_at: datetime
    extracted_entities: Optional[List[ExtractedEntityResponse]] = []

    class Config:
        from_attributes = True
