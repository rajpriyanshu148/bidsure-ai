from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tender import Tender
from app.models.bidder import Bidder
from app.models.compliance import ComplianceResult, RiskScore, AIRecommendation, OfficerDecision
from app.services.pdf_report_service import pdf_report_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/bidder/{bidder_id}/pdf")
def download_bidder_compliance_pdf(bidder_id: str, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    tender = db.query(Tender).filter(Tender.id == bidder.tender_id).first()
    results = db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id).all()
    risk = db.query(RiskScore).filter(RiskScore.bidder_id == bidder_id).first()
    rec = db.query(AIRecommendation).filter(AIRecommendation.bidder_id == bidder_id).first()
    decision = db.query(OfficerDecision).filter(OfficerDecision.bidder_id == bidder_id).order_by(OfficerDecision.decided_at.desc()).first()

    pdf_bytes = pdf_report_service.generate_compliance_report(
        tender=tender,
        bidder=bidder,
        compliance_results=results,
        risk_score=risk,
        recommendation=rec,
        decision=decision,
    )

    filename = f"BidSure_Compliance_{bidder.company_name.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
