from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tender import Tender
from app.models.bidder import Bidder
from app.models.document import Document, DocumentPage, ExtractedEntity
from app.models.compliance import ComplianceResult, RiskScore, AIRecommendation, OfficerDecision
from app.models.verification import GovernmentVerification
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.bidder import BidderResponse, BidderDetailResponse, RegisterAndBidRequest
from app.schemas.document import DocumentResponse
from app.schemas.compliance import (
    ComplianceSummaryResponse,
    ComplianceResultResponse,
    RiskScoreResponse,
    AIRecommendationResponse,
)
from app.schemas.verification import GovVerificationResponse
from app.schemas.decision import OfficerDecisionCreate, OfficerDecisionResponse
from app.schemas.audit import AuditLogResponse
from app.api.deps import get_current_user
from app.services.document_service import storage_provider, document_service
from app.services.compliance_service import compliance_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/bidders", tags=["Bidders"])


@router.get("/{bidder_id}", response_model=BidderDetailResponse)
def get_bidder_detail(bidder_id: str, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    docs_count = db.query(Document).filter(Document.bidder_id == bidder_id).count()
    passed = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id, ComplianceResult.status == "PASS").count()
    failed = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id, ComplianceResult.status == "FAIL").count()
    warning = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id, ComplianceResult.status == "WARNING").count()
    missing = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id, ComplianceResult.status == "MISSING").count()

    resp = BidderDetailResponse.from_orm(bidder)
    resp.documents_count = docs_count
    resp.passed_requirements = passed
    resp.failed_requirements = failed
    resp.warning_requirements = warning
    resp.missing_requirements = missing
    return resp


@router.post("/{bidder_id}/documents")
def upload_bidder_document(
    bidder_id: str,
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    content = file.file.read()
    saved_path = storage_provider.save_file(file.filename, content)

    classified_type, pages_data, entities_data = document_service.process_pdf(saved_path, file.filename)
    final_type = document_type if document_type else classified_type

    doc = Document(
        bidder_id=bidder_id,
        tender_id=bidder.tender_id,
        document_type=final_type,
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

    for ent in entities_data:
        ent_obj = ExtractedEntity(
            document_id=doc.id,
            bidder_id=bidder_id,
            entity_type=ent["entity_type"],
            raw_value=ent["raw_value"],
            normalized_value=ent.get("normalized_value"),
            confidence=ent.get("confidence", 0.90),
            page_number=ent.get("page_number", 1),
        )
        db.add(ent_obj)

    db.commit()

    audit_service.log_event(
        db=db,
        action="DOCUMENT_UPLOADED",
        entity_type="Bidder",
        entity_id=bidder_id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={"filename": file.filename, "type": final_type, "entities_count": len(entities_data)},
    )

    return {
        "message": "Document uploaded and parsed successfully",
        "document_id": doc.id,
        "classified_type": final_type,
        "pages": len(pages_data),
        "entities_extracted": len(entities_data),
    }


@router.get("/{bidder_id}/documents", response_model=List[DocumentResponse])
def get_bidder_documents(bidder_id: str, db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.bidder_id == bidder_id).all()


@router.post("/{bidder_id}/verify")
def trigger_bidder_verification(
    bidder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        res = compliance_service.run_full_verification(
            db=db,
            bidder_id=bidder_id,
            user_id=current_user.id,
            user_email=current_user.email,
        )
        return {"status": "success", "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bidder_id}/verification", response_model=List[GovVerificationResponse])
def get_bidder_verifications(bidder_id: str, db: Session = Depends(get_db)):
    return db.query(GovernmentVerification).filter(GovernmentVerification.bidder_id == bidder_id).all()


@router.get("/{bidder_id}/compliance", response_model=ComplianceSummaryResponse)
def get_bidder_compliance(bidder_id: str, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    tender = db.query(Tender).filter(Tender.id == bidder.tender_id).first()
    results = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id).all()
    risk = db.query(RiskScore).filter(RiskScore.bidder_id == bidder_id).first()
    rec = db.query(AIRecommendation).filter(AIRecommendation.bidder_id == bidder_id).first()

    status_counts = {
        "PASS": sum(1 for r in results if r.status == "PASS"),
        "WARNING": sum(1 for r in results if r.status == "WARNING"),
        "FAIL": sum(1 for r in results if r.status == "FAIL"),
        "MISSING": sum(1 for r in results if r.status == "MISSING"),
        "EXPIRED": sum(1 for r in results if r.status == "EXPIRED"),
    }

    return {
        "bidder_id": bidder.id,
        "company_name": bidder.company_name,
        "tender_number": tender.tender_number if tender else "N/A",
        "compliance_score": bidder.compliance_score,
        "risk_level": bidder.risk_level,
        "status_counts": status_counts,
        "compliance_results": results,
        "risk_details": risk,
        "recommendation": rec,
    }


@router.get("/{bidder_id}/risk", response_model=Optional[RiskScoreResponse])
def get_bidder_risk(bidder_id: str, db: Session = Depends(get_db)):
    return db.query(RiskScore).filter(RiskScore.bidder_id == bidder_id).first()


@router.get("/{bidder_id}/recommendation", response_model=Optional[AIRecommendationResponse])
def get_bidder_recommendation(bidder_id: str, db: Session = Depends(get_db)):
    return db.query(AIRecommendation).filter(AIRecommendation.bidder_id == bidder_id).first()


@router.get("/{bidder_id}/audit", response_model=List[AuditLogResponse])
def get_bidder_audit_logs(bidder_id: str, db: Session = Depends(get_db)):
    return db.query(AuditLog).filter(
        AuditLog.entity_id == bidder_id
    ).order_by(AuditLog.timestamp.desc()).all()


@router.post("/{bidder_id}/decision", response_model=OfficerDecisionResponse)
def submit_officer_decision(
    bidder_id: str,
    decision_in: OfficerDecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    # Save decision
    dec_obj = OfficerDecision(
        bidder_id=bidder_id,
        officer_id=current_user.id,
        officer_name=decision_in.officer_name or current_user.full_name,
        decision=decision_in.decision,
        justification_remarks=decision_in.justification_remarks,
        disclaimer_acknowledged=decision_in.disclaimer_acknowledged,
    )
    db.add(dec_obj)

    # Update bidder status
    bidder.officer_decision_status = decision_in.decision
    db.commit()
    db.refresh(dec_obj)

    audit_service.log_event(
        db=db,
        action="OFFICER_FINAL_DECISION_SUBMITTED",
        entity_type="Bidder",
        entity_id=bidder_id,
        user_id=current_user.id,
        user_email=current_user.email,
        new_value={
            "decision": decision_in.decision,
            "remarks": decision_in.justification_remarks,
            "officer": dec_obj.officer_name,
        },
        reason=f"Procurement Officer final recorded action: {decision_in.decision}",
    )

    return dec_obj


@router.post("/register-and-bid")
def register_company_and_bid(
    data: RegisterAndBidRequest,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == data.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # 1. Create Bidder record
    bidder = Bidder(
        tender_id=data.tender_id,
        company_name=data.company_name,
        cin=data.cin or "U28131MH2021PTC123456",
        pan=data.pan or "AAACZ9876K",
        gstin=data.gstin or "27AAACZ9876K1Z9",
        udyam_number=data.udyam_number or "UDYAM-MH-01-0098765",
        contact_email=data.contact_email or "vendor@bidsure.gov.in",
        contact_phone=data.contact_phone or "+91 98201 12345",
    )
    db.add(bidder)
    db.commit()
    db.refresh(bidder)

    turnover_amt = (data.turnover_cr or 25.0) * 10000000.0

    # 2. Synthesize Document 1: Financial Statements & Turnover
    doc_fin = Document(
        bidder_id=bidder.id,
        tender_id=tender.id,
        document_type="FINANCIAL_STATEMENTS",
        original_filename="Audited_Balance_Sheet_FY2024_2025.pdf",
        file_path="mock_storage/turnover.pdf",
        file_size=204850,
        mime_type="application/pdf",
        total_pages=1,
        ocr_status="COMPLETED",
        raw_text=f"CA AUDITED ANNUAL REPORT. Company: {data.company_name}. Average Annual Turnover: INR {turnover_amt:,.2f}. UDIN: 24058912AAAA8899. ICAI Membership No: 058912.",
    )
    db.add(doc_fin)
    db.commit()
    db.refresh(doc_fin)

    db.add(DocumentPage(
        document_id=doc_fin.id,
        page_number=1,
        text_content=doc_fin.raw_text,
    ))
    db.add(ExtractedEntity(
        document_id=doc_fin.id,
        bidder_id=bidder.id,
        entity_type="TURNOVER",
        raw_value=str(turnover_amt),
        normalized_value=str(turnover_amt),
        confidence=0.98,
        page_number=1,
    ))

    # 3. Document 2: GST Registration
    doc_gst = Document(
        bidder_id=bidder.id,
        tender_id=tender.id,
        document_type="GST_CERTIFICATE",
        original_filename="GST_Registration_Certificate_Form_REG06.pdf",
        file_path="mock_storage/gst.pdf",
        file_size=154200,
        mime_type="application/pdf",
        total_pages=1,
        ocr_status="COMPLETED",
        raw_text=f"GOODS AND SERVICES TAX REGISTRATION. Legal Name: {data.company_name}. GSTIN: {bidder.gstin}. Registration Status: ACTIVE. Taxpayer: Regular.",
    )
    db.add(doc_gst)
    db.commit()
    db.refresh(doc_gst)

    db.add(DocumentPage(document_id=doc_gst.id, page_number=1, text_content=doc_gst.raw_text))
    db.add(ExtractedEntity(
        document_id=doc_gst.id,
        bidder_id=bidder.id,
        entity_type="GSTIN",
        raw_value=bidder.gstin,
        normalized_value=bidder.gstin,
        confidence=0.99,
        page_number=1,
    ))

    # 4. Document 3: PAN Card
    doc_pan = Document(
        bidder_id=bidder.id,
        tender_id=tender.id,
        document_type="PAN_CARD",
        original_filename="Permanent_Account_Number_Card.pdf",
        file_path="mock_storage/pan.pdf",
        file_size=112000,
        mime_type="application/pdf",
        total_pages=1,
        ocr_status="COMPLETED",
        raw_text=f"INCOME TAX DEPARTMENT GOVT OF INDIA. Name: {data.company_name}. PAN: {bidder.pan}.",
    )
    db.add(doc_pan)
    db.commit()
    db.refresh(doc_pan)

    db.add(DocumentPage(document_id=doc_pan.id, page_number=1, text_content=doc_pan.raw_text))
    db.add(ExtractedEntity(
        document_id=doc_pan.id,
        bidder_id=bidder.id,
        entity_type="PAN",
        raw_value=bidder.pan,
        normalized_value=bidder.pan,
        confidence=0.99,
        page_number=1,
    ))

    # 5. Document 4: OEM Authorization (if indicated)
    if data.has_oem_auth:
        doc_oem = Document(
            bidder_id=bidder.id,
            tender_id=tender.id,
            document_type="OEM_AUTHORIZATION",
            original_filename="Manufacturer_Authorization_Form_C.pdf",
            file_path="mock_storage/oem.pdf",
            file_size=188000,
            mime_type="application/pdf",
            total_pages=1,
            ocr_status="COMPLETED",
            raw_text=f"MANUFACTURER AUTHORIZATION FORM (MAF). We hereby confirm that {data.company_name} is our authorized commercial channel partner for tender {tender.tender_number}. Full warranty and technical support guaranteed.",
        )
        db.add(doc_oem)
        db.commit()
        db.refresh(doc_oem)

        db.add(DocumentPage(document_id=doc_oem.id, page_number=1, text_content=doc_oem.raw_text))
        db.add(ExtractedEntity(
            document_id=doc_oem.id,
            bidder_id=bidder.id,
            entity_type="OEM_AUTHORIZATION",
            raw_value="Authorized Channel Partner",
            normalized_value="Authorized Channel Partner",
            confidence=0.96,
            page_number=1,
        ))

    # 6. Document 5: Make in India Local Content Declaration
    local_pct = data.local_content_pct or 60.0
    doc_mii = Document(
        bidder_id=bidder.id,
        tender_id=tender.id,
        document_type="MAKE_IN_INDIA",
        original_filename="Make_In_India_Self_Declaration.pdf",
        file_path="mock_storage/mii.pdf",
        file_size=135000,
        mime_type="application/pdf",
        total_pages=1,
        ocr_status="COMPLETED",
        raw_text=f"PUBLIC PROCUREMENT PREFERENCE TO MAKE IN INDIA ORDER 2017. Self-certification for {data.company_name}. Local value addition: {local_pct}%. Classification: Class-I Local Supplier.",
    )
    db.add(doc_mii)
    db.commit()
    db.refresh(doc_mii)

    db.add(DocumentPage(document_id=doc_mii.id, page_number=1, text_content=doc_mii.raw_text))
    db.add(ExtractedEntity(
        document_id=doc_mii.id,
        bidder_id=bidder.id,
        entity_type="LOCAL_CONTENT_PCT",
        raw_value=f"{local_pct}%",
        normalized_value=f"{local_pct}%",
        confidence=0.95,
        page_number=1,
    ))

    # 7. Document 6: Udyam Certificate (if provided)
    if bidder.udyam_number:
        doc_udyam = Document(
            bidder_id=bidder.id,
            tender_id=tender.id,
            document_type="MSME_CERTIFICATE",
            original_filename="Udyam_Registration_Certificate.pdf",
            file_path="mock_storage/udyam.pdf",
            file_size=142000,
            mime_type="application/pdf",
            total_pages=1,
            ocr_status="COMPLETED",
            raw_text=f"MINISTRY OF MICRO, SMALL AND MEDIUM ENTERPRISES. Udyam Registration Number: {bidder.udyam_number}. Name of Enterprise: {data.company_name}. Major Activity: Manufacturing.",
        )
        db.add(doc_udyam)
        db.commit()
        db.refresh(doc_udyam)

        db.add(DocumentPage(document_id=doc_udyam.id, page_number=1, text_content=doc_udyam.raw_text))
        db.add(ExtractedEntity(
            document_id=doc_udyam.id,
            bidder_id=bidder.id,
            entity_type="UDYAM_NUMBER",
            raw_value=bidder.udyam_number,
            normalized_value=bidder.udyam_number,
            confidence=0.97,
            page_number=1,
        ))

    db.commit()

    # 8. Run full compliance verification pipeline
    verification_summary = compliance_service.run_full_verification(
        db=db,
        bidder_id=bidder.id,
        user_email=bidder.contact_email,
    )

    db.refresh(bidder)

    # 9. Audit log event
    audit_service.log_event(
        db=db,
        action="COMPANY_REGISTERED_AND_BID_SUBMITTED",
        entity_type="Bidder",
        entity_id=bidder.id,
        user_email=bidder.contact_email,
        new_value={
            "company_name": bidder.company_name,
            "tender_number": tender.tender_number,
            "compliance_score": bidder.compliance_score,
            "risk_level": bidder.risk_level,
        },
        reason=f"Enterprise {bidder.company_name} registered and submitted formal bid on tender {tender.tender_number}",
    )

    return {
        "status": "success",
        "message": "Company registered and bid successfully submitted to GeM Technical Scrutiny.",
        "bid_reference": f"GEM/BID/2026/{bidder.id[:8].upper()}",
        "bidder_id": bidder.id,
        "company_name": bidder.company_name,
        "tender_id": tender.id,
        "tender_number": tender.tender_number,
        "compliance_score": bidder.compliance_score,
        "risk_level": bidder.risk_level,
        "verification_status": bidder.verification_status,
        "submitted_at": bidder.submitted_at.isoformat(),
    }
