from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.tender import Tender, TenderRequirement
from app.models.bidder import Bidder, VerificationStatus
from app.models.document import Document, DocumentPage, ExtractedEntity
from app.models.compliance import ComplianceResult, RiskScore, AIRecommendation
from app.models.verification import GovernmentVerification
from app.rules.rule_engine import rule_engine
from app.ai.llm_provider import get_llm_provider
from app.ai.rag_service import rag_service
from app.integrations.mock_government import (
    MockGSTProvider,
    MockPANProvider,
    MockUdyamProvider,
    MockBlacklistingProvider,
    MockIncomeTaxProvider,
    MockMCAProvider,
    MockMakeInIndiaProvider,
)
from app.services.audit_service import audit_service


class ComplianceService:
    @staticmethod
    def run_full_verification(db: Session, bidder_id: str, user_id: Optional[str] = None, user_email: Optional[str] = None) -> Dict[str, Any]:
        bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
        if not bidder:
            raise ValueError(f"Bidder with id {bidder_id} not found")

        tender = db.query(Tender).filter(Tender.id == bidder.tender_id).first()
        requirements = db.query(TenderRequirement).filter(TenderRequirement.tender_id == bidder.tender_id).all()
        documents = db.query(Document).filter(Document.bidder_id == bidder_id).all()
        entities = db.query(ExtractedEntity).filter(ExtractedEntity.bidder_id == bidder_id).all()

        # Update status to processing
        bidder.verification_status = VerificationStatus.PROCESSING.value
        db.commit()

        # Index documents into RAG for evidence citations
        rag_service.clear()
        for doc in documents:
            pages = db.query(DocumentPage).filter(DocumentPage.document_id == doc.id).all()
            rag_service.index_document(
                document_id=doc.id,
                document_name=doc.original_filename,
                document_type=doc.document_type,
                pages=[{"page_number": p.page_number, "text_content": p.text_content} for p in pages],
            )

        # Ensure Mock Government Verifications are generated
        verifications = db.query(GovernmentVerification).filter(GovernmentVerification.bidder_id == bidder_id).all()
        if not verifications:
            new_verifs = []
            # 1. GST
            gst_provider = MockGSTProvider()
            gst_res = gst_provider.verify(bidder.gstin or "03AAACA1234F1Z5")
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=gst_provider.source_name,
                query_param=bidder.gstin or "03AAACA1234F1Z5",
                status="SUCCESS",
                raw_response=gst_res,
                is_simulated=True,
            ))

            # 2. PAN
            pan_provider = MockPANProvider()
            pan_res = pan_provider.verify(bidder.pan or "AAACA1234F")
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=pan_provider.source_name,
                query_param=bidder.pan or "AAACA1234F",
                status="SUCCESS",
                raw_response=pan_res,
                is_simulated=True,
            ))

            # 3. Udyam
            udyam_provider = MockUdyamProvider()
            udyam_res = udyam_provider.verify(bidder.udyam_number or "UDYAM-PB-12-0012345")
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=udyam_provider.source_name,
                query_param=bidder.udyam_number or "UDYAM-PB-12-0012345",
                status="SUCCESS",
                raw_response=udyam_res,
                is_simulated=True,
            ))

            # 4. Blacklisting
            blacklisting_provider = MockBlacklistingProvider()
            bl_res = blacklisting_provider.verify(bidder.company_name)
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=blacklisting_provider.source_name,
                query_param=bidder.company_name,
                status="SUCCESS" if not bl_res.get("is_blacklisted") else "FAILED",
                raw_response=bl_res,
                is_simulated=True,
            ))

            # 5. Income Tax
            it_provider = MockIncomeTaxProvider()
            it_res = it_provider.verify(bidder.pan or "AAACA1234F")
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=it_provider.source_name,
                query_param=bidder.pan or "AAACA1234F",
                status="SUCCESS",
                raw_response=it_res,
                is_simulated=True,
            ))

            # 6. MCA
            mca_provider = MockMCAProvider()
            mca_res = mca_provider.verify(bidder.cin or "U28131PB2019PTC050123")
            new_verifs.append(GovernmentVerification(
                bidder_id=bidder_id,
                source=mca_provider.source_name,
                query_param=bidder.cin or "U28131PB2019PTC050123",
                status="SUCCESS",
                raw_response=mca_res,
                is_simulated=True,
            ))

            for v in new_verifs:
                db.add(v)
            db.commit()
            verifications = new_verifs

        # Evaluate deterministic rules
        results_list, final_score, risk_level, critical_override, override_reason = rule_engine.evaluate_bidder(
            bidder=bidder,
            requirements=requirements,
            documents=documents,
            entities=entities,
            verifications=verifications,
        )

        # Clear existing compliance results for fresh run
        db.query(ComplianceResult).filter(ComplianceResult.bidder_id == bidder_id).delete()

        created_results = []
        raw_results_for_ai = []

        for item in results_list:
            req_id = item["requirement_id"]
            rule_name = item["rule_name"]
            res = item["rule_result"]

            cr = ComplianceResult(
                bidder_id=bidder_id,
                requirement_id=req_id,
                rule_name=rule_name,
                status=res.status.value,
                score=res.score,
                confidence=res.confidence,
                reason=res.reason,
                expected_value=res.expected_value,
                actual_value=res.actual_value,
                difference=res.difference,
                evidence_document_id=res.evidence_document_id,
                evidence_page_number=res.evidence_page_number,
                evidence_snippet=res.evidence_snippet,
                rule_metadata=res.rule_metadata,
            )
            db.add(cr)
            created_results.append(cr)

            raw_results_for_ai.append({
                "rule_name": rule_name,
                "status": res.status.value,
                "reason": res.reason,
                "expected_value": res.expected_value,
                "actual_value": res.actual_value,
                "difference": res.difference,
            })

        # Save risk score record
        db.query(RiskScore).filter(RiskScore.bidder_id == bidder_id).delete()
        risk_score_obj = RiskScore(
            bidder_id=bidder_id,
            numerical_score=final_score,
            risk_level=risk_level,
            critical_override_applied=critical_override,
            override_reason=override_reason if critical_override else None,
            breakdown={
                "weighted_score": final_score,
                "total_requirements": len(requirements),
                "passed": sum(1 for r in results_list if r["rule_result"].status.value == "PASS"),
                "failed": sum(1 for r in results_list if r["rule_result"].status.value == "FAIL"),
                "missing": sum(1 for r in results_list if r["rule_result"].status.value == "MISSING"),
                "warning": sum(1 for r in results_list if r["rule_result"].status.value == "WARNING"),
            },
        )
        db.add(risk_score_obj)

        # Generate grounded AI recommendation
        llm = get_llm_provider()
        ai_rec = llm.generate_recommendation(
            bidder_name=bidder.company_name,
            tender_number=tender.tender_number if tender else "TENDER",
            compliance_results=raw_results_for_ai,
            score=final_score,
            risk_level=risk_level,
        )

        db.query(AIRecommendation).filter(AIRecommendation.bidder_id == bidder_id).delete()
        recommendation_obj = AIRecommendation(
            bidder_id=bidder_id,
            overall_assessment=ai_rec["overall_assessment"],
            key_issues=ai_rec.get("key_issues", []),
            positive_checks=ai_rec.get("positive_checks", []),
            recommendation_text=ai_rec["recommendation_text"],
            advisory_disclaimer=ai_rec["advisory_disclaimer"],
        )
        db.add(recommendation_obj)

        # Update bidder master
        bidder.compliance_score = final_score
        bidder.risk_level = risk_level
        bidder.verification_status = VerificationStatus.VERIFIED.value

        db.commit()

        # Log audit event
        audit_service.log_event(
            db=db,
            action="COMPLIANCE_EVALUATED",
            entity_type="Bidder",
            entity_id=bidder_id,
            user_id=user_id,
            user_email=user_email,
            new_value={
                "score": final_score,
                "risk_level": risk_level,
                "critical_override": critical_override,
            },
            reason=f"Verification executed. Final score: {final_score}/100, Risk: {risk_level}",
        )

        return {
            "bidder_id": bidder_id,
            "compliance_score": final_score,
            "risk_level": risk_level,
            "critical_override": critical_override,
            "override_reason": override_reason,
            "results_count": len(created_results),
            "recommendation": ai_rec,
        }


compliance_service = ComplianceService()
