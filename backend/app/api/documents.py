from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document, DocumentPage, ExtractedEntity
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentPageResponse, ExtractedEntityResponse, EntityCorrectionRequest
from app.api.deps import get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/pages", response_model=List[DocumentPageResponse])
def get_document_pages(document_id: str, db: Session = Depends(get_db)):
    pages = db.query(DocumentPage).filter(DocumentPage.document_id == document_id).order_by(DocumentPage.page_number).all()
    return pages


@router.put("/entities/{entity_id}", response_model=ExtractedEntityResponse)
def manually_correct_entity(
    entity_id: str,
    req: EntityCorrectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entity = db.query(ExtractedEntity).filter(ExtractedEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Extracted entity not found")

    old_raw = entity.raw_value

    if not entity.original_ai_value:
        entity.original_ai_value = old_raw

    entity.raw_value = req.new_value
    entity.normalized_value = req.new_value
    entity.is_manually_edited = True
    entity.edited_by = current_user.full_name or current_user.email
    entity.edit_reason = req.reason
    entity.confidence = 1.0  # Manually verified by officer

    db.commit()
    db.refresh(entity)

    audit_service.log_event(
        db=db,
        action="ENTITY_MANUALLY_CORRECTED",
        entity_type="ExtractedEntity",
        entity_id=entity.id,
        user_id=current_user.id,
        user_email=current_user.email,
        old_value={"value": old_raw},
        new_value={"value": req.new_value, "edited_by": entity.edited_by},
        reason=req.reason,
    )

    return entity