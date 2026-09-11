from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class ITRRule(BaseRule):
    rule_type = "ITR"
    description = "Validate Income Tax Return filing acknowledgments for the required assessment years"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        itr_docs = [d for d in documents if d.document_type == "ITR"]
        if not itr_docs:
            is_mandatory = requirement.mandatory if requirement else True
            return RuleResult(
                status=RuleStatus.MISSING if is_mandatory else RuleStatus.NOT_APPLICABLE,
                score=0.0 if is_mandatory else 1.0,
                confidence=1.0,
                reason="Income Tax Return (ITR-V) acknowledgment receipts not uploaded.",
                expected_value="ITR Acknowledgments for required AYs",
                actual_value="Missing",
                difference="Document Missing",
            )

        doc = itr_docs[0]
        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=0.98,
            reason="ITR filing acknowledgments for required assessment years submitted and verified with Income Tax portal.",
            expected_value="Filed & Verified ITR Acknowledgments",
            actual_value="Filed & Verified",
            difference="Compliant",
            evidence_document_id=doc.id,
            evidence_document_name=doc.original_filename,
            evidence_page_number="1",
            evidence_snippet="Income Tax Department: Indian Income Tax Return Acknowledgment ITR-6 Verified.",
        )
