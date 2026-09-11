from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.tender import Tender, TenderRequirement, TenderStatus
from app.models.bidder import Bidder
from app.models.document import Document, DocumentType, DocumentPage
from app.models.user import User
from app.schemas.tender import (
    TenderCreate,
    TenderUpdate,
    TenderResponse,
    TenderDetailResponse,
    TenderRequirementCreate,
    TenderRequirementUpdate,
    TenderRequirementResponse,
)
from app.schemas.bidder import BidderResponse, BidderCreate
from app.api.deps import get_current_user
from app.ai.llm_provider import get_llm_provider
from app.services.document_service import storage_provider, document_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/tenders", tags=["Tenders"])


@router.post("", response_model=TenderDetailResponse)
def create_tender(
    tender_in: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Tender).filter(Tender.tender_number == tender_in.tender_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tender number already exists")

    tender = Tender(
        tender_number=tender_in.tender_number,
        title=tender_in.title,
        description=tender_in.description,
        category=tender_in.category,
        estimated_value=tender_in.estimated_value,
        closing_date=tender_in.closing_date,
        status=TenderStatus.ACTIVE.value,
        created_by_id=current_user.id,
    )
    db.add(tender)
    db.commit()
    db.refresh(tender)

    # Add initial requirements if provided
    for req in tender_in.requirements or []:
        req_obj = TenderRequirement(
            tender_id=tender.id,
            rule_type=req.rule_type,
            description=req.description,
            min_value=req.min_value,
            max_value=req.max_value,
            expected_text=req.expected_text,
            currency=req.currency,
            weight=req.weight,
            mandatory=req.mandatory,
            is_critical=req.is_critical,
        )
        db.add(req_obj)
    db.commit()
    db.refresh(tender)

    audit_service.log_event(
        db=db,
        action="TENDER_CREATED",
        entity_type="Tender",
        entity_id=tender.id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"tender_number": tender.tender_number, "title": tender.title},
    )

    return tender


@router.get("", response_model=List[TenderResponse])
def list_tenders(db: Session = Depends(get_db)):
    tenders = db.query(Tender).order_by(Tender.created_at.desc()).all()
    results = []
    for t in tenders:
        bidders_count = db.query(Bidder).filter(Bidder.tender_id == t.id).count()
        avg_score = db.query(func.avg(Bidder.compliance_score)).filter(Bidder.tender_id == t.id).scalar() or 0.0
        resp = TenderResponse.from_orm(t)
        resp.bidders_count = bidders_count
        resp.average_score = round(avg_score, 1)
        results.append(resp)
    return results


@router.get("/{tender_id}", response_model=TenderDetailResponse)
def get_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender


@router.put("/{tender_id}", response_model=TenderResponse)
def update_tender(
    tender_id: str,
    tender_update: TenderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    old_val = {"title": tender.title, "status": tender.status}
    for field, value in tender_update.dict(exclude_unset=True).items():
        setattr(tender, field, value)

    db.commit()
    db.refresh(tender)

    audit_service.log_event(
        db=db,
        action="TENDER_UPDATED",
        entity_type="Tender",
        entity_id=tender.id,
        user_id=current_user.id,
        user_email=current_user.email,
        old_value=old_val,
        new_value={"title": tender.title, "status": tender.status},
    )
    return tender


@router.post("/{tender_id}/documents")
def upload_tender_document(
    tender_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    content = file.file.read()
    saved_path = storage_provider.save_file(file.filename, content)

    doc_type, pages_data, _ = document_service.process_pdf(saved_path, file.filename)

    doc = Document(
        tender_id=tender_id,
        document_type=DocumentType.TENDER_DOCUMENT.value,
        original_filename=file.filename,
        file_path=saved_path,
        file_size=len(content),
        mime_type=file.content_type or "application/pdf",
        total_pages=len(pages_data),
        ocr_status="COMPLETED",
        raw_text="\n".join([p.get("text_content", "") for p in pages_data]),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    for p in pages_data:
        p_obj = DocumentPage(
            document_id=doc.id,
            page_number=p["page_number"],
            text_content=p["text_content"],
            has_images=p.get("has_images", False),
        )
        db.add(p_obj)
    db.commit()

    audit_service.log_event(
        db=db,
        action="DOCUMENT_UPLOADED",
        entity_type="Tender",
        entity_id=tender_id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"filename": file.filename, "pages": len(pages_data)},
    )

    return {"message": "Tender document uploaded successfully", "document_id": doc.id, "pages": len(pages_data)}


@router.post("/{tender_id}/extract-requirements", response_model=List[TenderRequirementResponse])
def extract_tender_requirements(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tender_docs = db.query(Document).filter(Document.tender_id == tender_id).all()
    full_text = "\n".join([d.raw_text or "" for d in tender_docs]) if tender_docs else tender.description or ""

    llm = get_llm_provider()
    extracted_reqs = llm.extract_tender_requirements(full_text)

    # Save to database
    saved_reqs = []
    for r in extracted_reqs:
        # Check if identical rule type exists
        existing = db.query(TenderRequirement).filter(
            TenderRequirement.tender_id == tender_id,
            TenderRequirement.rule_type == r.get("rule_type"),
        ).first()

        if not existing:
            req_obj = TenderRequirement(
                tender_id=tender_id,
                rule_type=r.get("rule_type", "CUSTOM"),
                description=r.get("description", "Eligibility Requirement"),
                min_value=r.get("min_value"),
                max_value=r.get("max_value"),
                expected_text=r.get("expected_text"),
                weight=r.get("weight", 10.0),
                mandatory=r.get("mandatory", True),
                is_critical=r.get("is_critical", False),
            )
            db.add(req_obj)
            saved_reqs.append(req_obj)

    db.commit()
    for s in saved_reqs:
        db.refresh(s)

    audit_service.log_event(
        db=db,
        action="REQUIREMENT_EXTRACTED",
        entity_type="Tender",
        entity_id=tender_id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"extracted_count": len(saved_reqs)},
    )

    return db.query(TenderRequirement).filter(TenderRequirement.tender_id == tender_id).all()


@router.get("/{tender_id}/requirements", response_model=List[TenderRequirementResponse])
def get_tender_requirements(tender_id: str, db: Session = Depends(get_db)):
    return db.query(TenderRequirement).filter(TenderRequirement.tender_id == tender_id).all()


@router.post("/{tender_id}/requirements", response_model=TenderRequirementResponse)
def add_tender_requirement(
    tender_id: str,
    req_in: TenderRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req_obj = TenderRequirement(
        tender_id=tender_id,
        rule_type=req_in.rule_type,
        description=req_in.description,
        min_value=req_in.min_value,
        max_value=req_in.max_value,
        expected_text=req_in.expected_text,
        currency=req_in.currency,
        weight=req_in.weight,
        mandatory=req_in.mandatory,
        is_critical=req_in.is_critical,
    )
    db.add(req_obj)
    db.commit()
    db.refresh(req_obj)

    audit_service.log_event(
        db=db,
        action="REQUIREMENT_ADDED_MANUALLY",
        entity_type="TenderRequirement",
        entity_id=req_obj.id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"rule_type": req_obj.rule_type, "description": req_obj.description},
    )
    return req_obj


@router.put("/requirements/{requirement_id}", response_model=TenderRequirementResponse)
def update_tender_requirement(
    requirement_id: str,
    req_update: TenderRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(TenderRequirement).filter(TenderRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    old_val = {"description": req.description, "min_value": req.min_value, "weight": req.weight}
    for field, value in req_update.dict(exclude_unset=True).items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)

    audit_service.log_event(
        db=db,
        action="REQUIREMENT_EDITED",
        entity_type="TenderRequirement",
        entity_id=req.id,
        user_id=current_user.id,
        user_email=current_user.email,
        old_value=old_val,
        new_value={"description": req.description, "min_value": req.min_value, "weight": req.weight},
        reason="Manual adjustment by Procurement Officer",
    )
    return req


@router.delete("/requirements/{requirement_id}")
def delete_tender_requirement(
    requirement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(TenderRequirement).filter(TenderRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()

    audit_service.log_event(
        db=db,
        action="REQUIREMENT_DELETED",
        entity_type="TenderRequirement",
        entity_id=requirement_id,
        user_id=current_user.id,
        user_email=current_user.email,
    )
    return {"message": "Requirement deleted successfully"}


@router.post("/{tender_id}/bidders", response_model=BidderResponse)
def add_bidder_to_tender(
    tender_id: str,
    bidder_in: BidderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bidder = Bidder(
        tender_id=tender_id,
        company_name=bidder_in.company_name,
        cin=bidder_in.cin,
        pan=bidder_in.pan,
        gstin=bidder_in.gstin,
        udyam_number=bidder_in.udyam_number,
        contact_email=bidder_in.contact_email,
        contact_phone=bidder_in.contact_phone,
    )
    db.add(bidder)
    db.commit()
    db.refresh(bidder)

    audit_service.log_event(
        db=db,
        action="BIDDER_CREATED",
        entity_type="Bidder",
        entity_id=bidder.id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"company_name": bidder.company_name},
    )
    return bidder


@router.get("/{tender_id}/bidders", response_model=List[BidderResponse])
def get_tender_bidders(tender_id: str, db: Session = Depends(get_db)):
    return db.query(Bidder).filter(Bidder.tender_id == tender_id).all()
