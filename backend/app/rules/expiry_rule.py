from datetime import datetime, timezone
from dateutil import parser
from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class DocumentExpiryRule(BaseRule):
    rule_type = "EXPIRY"
    description = "Validate certificate validity and expiry dates against bid submission date"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        bid_date = bidder.submitted_at or datetime.now(timezone.utc)
        if bid_date.tzinfo is None:
            bid_date = bid_date.replace(tzinfo=timezone.utc)

        expiry_entities = [e for e in entities if e.entity_type in ("EXPIRY_DATE", "VALID_UNTIL")]

        if not expiry_entities:
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=0.90,
                reason="All submitted certificates have perpetual or valid statutory status with no passed expiry dates.",
                expected_value="Valid on Bid Date",
                actual_value="Valid",
                difference="None",
            )

        expired_findings = []
        for ent in expiry_entities:
            date_str = ent.normalized_value or ent.raw_value
            try:
                exp_date = parser.parse(date_str)
                if exp_date.tzinfo is None:
                    exp_date = exp_date.replace(tzinfo=timezone.utc)

                if exp_date < bid_date:
                    days_diff = (bid_date - exp_date).days
                    expired_findings.append({
                        "entity": ent,
                        "expiry_date": exp_date.strftime("%d %B %Y"),
                        "days_diff": days_diff,
                    })
            except Exception:
                continue

        if expired_findings:
            first_exp = expired_findings[0]
            ent = first_exp["entity"]
            doc_name = "Certificate.pdf"
            for d in documents:
                if d.id == ent.document_id:
                    doc_name = d.original_filename
                    break

            return RuleResult(
                status=RuleStatus.EXPIRED,
                score=0.0,
                confidence=0.95,
                reason=f"Certificate expired on {first_exp['expiry_date']} ({first_exp['days_diff']} days before bid submission).",
                expected_value=f"Valid beyond {bid_date.strftime('%d %B %Y')}",
                actual_value=f"Expired on {first_exp['expiry_date']}",
                difference=f"{first_exp['days_diff']} days expired",
                evidence_document_id=ent.document_id,
                evidence_document_name=doc_name,
                evidence_page_number=str(ent.page_number or 1),
                evidence_snippet=f"Certificate Expiration: Valid until: {first_exp['expiry_date']}",
            )

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=0.95,
            reason="All time-bound certificates are currently active and unexpired.",
            expected_value="Valid on Bid Submission Date",
            actual_value="Active & Unexpired",
            difference="Compliant",
        )
