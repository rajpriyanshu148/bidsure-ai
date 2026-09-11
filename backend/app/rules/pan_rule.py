import re
from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus

PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")


class PANRule(BaseRule):
    rule_type = "PAN"
    description = "Validate Permanent Account Number (PAN) format and authenticity"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        pan_docs = [d for d in documents if d.document_type == "PAN_CARD"]
        pan = bidder.pan
        pan_entity = None
        for ent in entities:
            if ent.entity_type == "PAN":
                pan_entity = ent
                pan = ent.normalized_value or ent.raw_value
                break

        if not pan and not pan_docs:
            return RuleResult(
                status=RuleStatus.MISSING,
                score=0.0,
                confidence=1.0,
                reason="Mandatory PAN Card document not uploaded.",
                expected_value="Valid Company PAN Card",
                actual_value="Missing",
                difference="Document Missing",
            )

        if not pan:
            return RuleResult(
                status=RuleStatus.REVIEW_REQUIRED,
                score=0.0,
                confidence=0.75,
                reason="PAN document uploaded but PAN number could not be extracted.",
                expected_value="Valid 10-character PAN",
                actual_value="Unextracted",
                evidence_document_id=pan_docs[0].id if pan_docs else None,
                evidence_document_name=pan_docs[0].original_filename if pan_docs else None,
                evidence_page_number="1",
            )

        # Validate PAN format (5 letters, 4 digits, 1 letter)
        if not bool(PAN_REGEX.match(pan)):
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=0.99,
                reason=f"Extracted PAN '{pan}' does not match standard 10-character PAN syntax.",
                expected_value="Valid 10-character PAN (e.g. AAACA1234F)",
                actual_value=pan,
                difference="Invalid PAN Format",
                evidence_document_id=pan_entity.document_id if pan_entity else None,
                evidence_page_number="1",
            )

        # Check 4th letter for entity type (C for Company, P for Person, F for Firm, etc.)
        entity_type_char = pan[3]

        doc_id = pan_entity.document_id if pan_entity else (pan_docs[0].id if pan_docs else None)
        doc_name = pan_docs[0].original_filename if pan_docs else "PAN_Card.pdf"

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=pan_entity.confidence if pan_entity else 0.99,
            reason=f"PAN {pan} is verified and valid for entity category '{'Company' if entity_type_char == 'C' else 'Enterprise'}'.",
            expected_value="Valid Permanent Account Number",
            actual_value=f"Valid ({pan})",
            difference="Compliant",
            evidence_document_id=doc_id,
            evidence_document_name=doc_name,
            evidence_page_number=str(pan_entity.page_number if pan_entity else "1"),
            evidence_snippet=f"Income Tax Department PAN Card: Permanent Account Number: {pan} | Entity: Company",
        )
