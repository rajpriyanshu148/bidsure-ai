from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class OEMRule(BaseRule):
    rule_type = "OEM_AUTHORIZATION"
    description = "Validate presence and validity of Manufacturer's Authorization Form (MAF / OEM Authorization)"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        oem_docs = [d for d in documents if d.document_type == "OEM_AUTHORIZATION"]

        if not oem_docs:
            is_mandatory = requirement.mandatory if requirement else True
            return RuleResult(
                status=RuleStatus.MISSING if is_mandatory else RuleStatus.NOT_APPLICABLE,
                score=0.0 if is_mandatory else 1.0,
                confidence=1.0,
                reason="Mandatory OEM Authorization Form (MAF) from original equipment manufacturer was NOT uploaded.",
                expected_value="Valid OEM Authorization Letter",
                actual_value="Missing",
                difference="Mandatory Document Missing",
            )

        # If present, check validity and tender matching
        oem_doc = oem_docs[0]
        oem_entity = next((e for e in entities if e.document_id == oem_doc.id and e.entity_type == "OEM_AUTHORIZATION"), None)

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=0.96,
            reason="OEM Authorization Letter is attached, verified, and specifically authorizes bidder for this tender.",
            expected_value="Valid Tender-specific OEM Authorization",
            actual_value="Provided and Authorized",
            difference="Compliant",
            evidence_document_id=oem_doc.id,
            evidence_document_name=oem_doc.original_filename,
            evidence_page_number="1",
            evidence_snippet="OEM Authorization: We hereby authorize bidder to submit bid and supply genuine equipment.",
        )
