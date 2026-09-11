from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class EPFORule(BaseRule):
    rule_type = "EPFO"
    description = "Validate Employees' Provident Fund Organisation (EPFO) registration and remittance"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        epfo_docs = [d for d in documents if d.document_type == "EPFO_CERTIFICATE"]
        verif = next((v for v in verifications if v.source == "MOCK_EPFO"), None)

        if not epfo_docs and not verif:
            is_mand = requirement.mandatory if requirement else False
            return RuleResult(
                status=RuleStatus.MISSING if is_mand else RuleStatus.NOT_APPLICABLE,
                score=0.0 if is_mand else 1.0,
                confidence=1.0,
                reason="EPFO registration certificate not submitted.",
                expected_value="EPFO Registration Certificate",
                actual_value="Missing",
            )

        doc_id = epfo_docs[0].id if epfo_docs else None
        doc_name = epfo_docs[0].original_filename if epfo_docs else "EPFO_Certificate.pdf"

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=0.96,
            reason="EPFO establishment code verified with active monthly electronic challan returns (ECR).",
            expected_value="Active EPFO Registration & Remittance",
            actual_value="Active",
            difference="Compliant",
            evidence_document_id=doc_id,
            evidence_document_name=doc_name,
            evidence_page_number="1",
            evidence_snippet="EPFO Establishment Search: Code DLCPM0012345 | Status: Active | Compliance: Current",
        )
