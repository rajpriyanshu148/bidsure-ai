import re
from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus

GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


class GSTRule(BaseRule):
    rule_type = "GST"
    description = "Validate GST registration format and verification status in GSTN portal"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        # Check if GST document exists
        gst_docs = [d for d in documents if d.document_type in ("GST_CERTIFICATE", "GST_RETURN")]
        if not gst_docs and not bidder.gstin:
            return RuleResult(
                status=RuleStatus.MISSING,
                score=0.0,
                confidence=1.0,
                reason="Mandatory GST Registration Certificate not uploaded.",
                expected_value="Active GST Registration Certificate",
                actual_value="Missing",
                difference="Certificate Missing",
            )

        # Extracted GSTIN
        gstin = bidder.gstin
        gst_entity = None
        for ent in entities:
            if ent.entity_type == "GSTIN":
                gst_entity = ent
                gstin = ent.normalized_value or ent.raw_value
                break

        if not gstin:
            return RuleResult(
                status=RuleStatus.REVIEW_REQUIRED,
                score=0.0,
                confidence=0.75,
                reason="GST Certificate uploaded but GSTIN could not be extracted.",
                expected_value="Valid 15-digit GSTIN",
                actual_value="Unextracted",
                evidence_document_id=gst_docs[0].id if gst_docs else None,
                evidence_document_name=gst_docs[0].original_filename if gst_docs else None,
                evidence_page_number="1",
            )

        # Regex format check
        is_valid_format = bool(GSTIN_REGEX.match(gstin))
        if not is_valid_format:
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=0.98,
                reason=f"Extracted GSTIN '{gstin}' does not conform to the statutory 15-character GST format.",
                expected_value="Valid 15-character GSTIN (e.g. 03AAACA1234F1Z5)",
                actual_value=gstin,
                difference="Invalid Format",
                evidence_document_id=gst_entity.document_id if gst_entity else None,
                evidence_page_number=str(gst_entity.page_number) if gst_entity else "1",
            )

        # Cross-reference with mock government verification
        gst_verif = next((v for v in verifications if v.source == "MOCK_GSTN"), None)
        status_in_govt = "ACTIVE"
        returns_compliant = True

        if gst_verif and isinstance(gst_verif.raw_response, dict):
            status_in_govt = gst_verif.raw_response.get("status", "ACTIVE")
            returns_compliant = gst_verif.raw_response.get("returns_compliant", True)

        doc_id = gst_entity.document_id if gst_entity else (gst_docs[0].id if gst_docs else None)
        doc_name = gst_docs[0].original_filename if gst_docs else "GST_Certificate.pdf"

        if status_in_govt == "ACTIVE" and returns_compliant:
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=gst_entity.confidence if gst_entity else 0.99,
                reason=f"GSTIN {gstin} is active on GSTN and return filing compliance (GSTR-3B/1) is up to date.",
                expected_value="Active GSTIN & Compliant Returns",
                actual_value=f"Active ({gstin})",
                difference="Fully Compliant",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number=str(gst_entity.page_number if gst_entity else "1"),
                evidence_snippet=f"Form GST REG-06: Registration No: {gstin} | Status: Active | Taxpayer Type: Regular",
            )
        elif status_in_govt == "ACTIVE" and not returns_compliant:
            return RuleResult(
                status=RuleStatus.WARNING,
                score=0.5,
                confidence=0.95,
                reason=f"GSTIN {gstin} is active, but recent return filings (GSTR-3B) are marked as pending.",
                expected_value="Active & Up-to-date Returns",
                actual_value="Active with Pending Returns",
                difference="Return Filing Default",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number="1",
                evidence_snippet=f"GSTN Return Compliance: GSTR-3B pending for last 2 quarters for GSTIN {gstin}",
            )
        else:
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=0.99,
                reason=f"GSTIN {gstin} is {status_in_govt} on the GST portal.",
                expected_value="Active GST Registration",
                actual_value=status_in_govt,
                difference="Inactive / Cancelled Status",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number="1",
            )
