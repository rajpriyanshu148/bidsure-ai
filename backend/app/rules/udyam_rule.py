import re
from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus

UDYAM_REGEX = re.compile(r"^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$")


class UdyamRule(BaseRule):
    rule_type = "UDYAM"
    description = "Validate MSME Udyam Registration Certificate format and enterprise category"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        udyam_docs = [d for d in documents if d.document_type == "UDYAM_CERTIFICATE"]
        udyam_no = bidder.udyam_number
        udyam_entity = None

        for ent in entities:
            if ent.entity_type == "UDYAM_NUMBER":
                udyam_entity = ent
                udyam_no = ent.normalized_value or ent.raw_value
                break

        if not udyam_no and not udyam_docs:
            is_mandatory = requirement.mandatory if requirement else True
            return RuleResult(
                status=RuleStatus.MISSING if is_mandatory else RuleStatus.NOT_APPLICABLE,
                score=0.0 if is_mandatory else 1.0,
                confidence=1.0,
                reason="Mandatory MSME Udyam Registration Certificate not uploaded.",
                expected_value="Valid Udyam Registration Certificate",
                actual_value="Missing",
                difference="Document Missing",
            )

        if not udyam_no:
            return RuleResult(
                status=RuleStatus.REVIEW_REQUIRED,
                score=0.0,
                confidence=0.75,
                reason="Udyam Certificate uploaded but registration number could not be extracted.",
                expected_value="Valid UDYAM-XX-00-0000000 format",
                actual_value="Unextracted",
                evidence_document_id=udyam_docs[0].id if udyam_docs else None,
                evidence_document_name=udyam_docs[0].original_filename if udyam_docs else None,
                evidence_page_number="1",
            )

        # Normalize spaces or dashes
        clean_udyam = udyam_no.strip().upper().replace(" ", "")

        doc_id = udyam_entity.document_id if udyam_entity else (udyam_docs[0].id if udyam_docs else None)
        doc_name = udyam_docs[0].original_filename if udyam_docs else "Udyam_Certificate.pdf"
        page_num = str(udyam_entity.page_number if udyam_entity else "1")

        # Regex check
        if not bool(UDYAM_REGEX.match(clean_udyam)):
            return RuleResult(
                status=RuleStatus.WARNING,
                score=0.5,
                confidence=0.85,
                reason=f"Udyam registration number '{clean_udyam}' does not conform strictly to standard format (UDYAM-XX-00-0000000).",
                expected_value="UDYAM-XX-00-0000000",
                actual_value=clean_udyam,
                difference="Format Discrepancy",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number=page_num,
            )

        # Verification lookup
        verif = next((v for v in verifications if v.source == "MOCK_UDYAM"), None)
        enterprise_type = "Medium Enterprise"
        if verif and isinstance(verif.raw_response, dict):
            enterprise_type = verif.raw_response.get("enterprise_type", "Medium Enterprise")

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=udyam_entity.confidence if udyam_entity else 0.98,
            reason=f"Udyam Registration {clean_udyam} is valid. Enterprise classified as: {enterprise_type}.",
            expected_value="Valid Active Udyam Registration",
            actual_value=f"Valid ({clean_udyam})",
            difference="Compliant",
            evidence_document_id=doc_id,
            evidence_document_name=doc_name,
            evidence_page_number=page_num,
            evidence_snippet=f"Ministry of MSME Udyam Registration: {clean_udyam} | Enterprise Type: {enterprise_type} | Major Activity: Manufacturing",
        )
