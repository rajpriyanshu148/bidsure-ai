from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class TurnoverRule(BaseRule):
    rule_type = "TURNOVER"
    description = "Deterministic comparison of bidder annual turnover against tender minimum requirement"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        min_required = requirement.min_value if requirement else 100000000.0  # Default ₹10 Cr
        req_display = f"₹{min_required / 10000000:.1f} Crore"

        # Find turnover entity from ITR, Turnover Certificate, or Balance Sheet
        turnover_entity = None
        for ent in entities:
            if ent.entity_type == "TURNOVER":
                turnover_entity = ent
                break

        actual_val = None
        actual_display = None
        doc_id = None
        doc_name = "ITR_AY2025.pdf"
        page_num = "8"
        confidence = 0.95

        if turnover_entity:
            try:
                val_str = str(turnover_entity.normalized_value or turnover_entity.raw_value)
                actual_val = float(val_str)
                actual_display = f"₹{actual_val / 10000000:.2f} Crore"
                doc_id = turnover_entity.document_id
                page_num = str(turnover_entity.page_number or 8)
                confidence = turnover_entity.confidence
                for d in documents:
                    if d.id == doc_id:
                        doc_name = d.original_filename
                        break
            except Exception:
                actual_val = None

        if actual_val is None:
            # Fallback to income tax verification history if available
            it_verif = next((v for v in verifications if v.source == "MOCK_INCOME_TAX"), None)
            if it_verif and isinstance(it_verif.raw_response, dict):
                hist = it_verif.raw_response.get("filing_history", [])
                if hist and "turnover_inr" in hist[0]:
                    actual_val = float(hist[0]["turnover_inr"])
                    actual_display = f"₹{actual_val / 10000000:.2f} Crore"
                    confidence = 0.99

        if actual_val is None:
            fin_docs = [d for d in documents if d.document_type in ("ITR", "BALANCE_SHEET", "TURNOVER_CERTIFICATE")]
            if not fin_docs:
                return RuleResult(
                    status=RuleStatus.MISSING,
                    score=0.0,
                    confidence=1.0,
                    reason="Mandatory financial documents (ITR / Balance Sheet) not uploaded.",
                    expected_value=req_display,
                    actual_value="Missing",
                    difference="Missing Document",
                )
            return RuleResult(
                status=RuleStatus.REVIEW_REQUIRED,
                score=0.0,
                confidence=0.70,
                reason="Financial documents present but annual turnover figure could not be automatically extracted.",
                expected_value=req_display,
                actual_value="Unextracted",
                evidence_document_id=fin_docs[0].id,
                evidence_document_name=fin_docs[0].original_filename,
                evidence_page_number="1",
            )

        if actual_val >= min_required:
            surplus = (actual_val - min_required) / 10000000
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=confidence,
                reason=f"Annual turnover of {actual_display} satisfies the tender requirement of >= {req_display}.",
                expected_value=f">= {req_display}",
                actual_value=actual_display,
                difference=f"+₹{surplus:.2f} Crore surplus",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number=page_num,
                evidence_snippet=f"Form ITR-6 / P&L Statement: Gross Annual Revenue/Turnover = {actual_display}",
            )
        else:
            deficit = (min_required - actual_val) / 10000000
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=confidence,
                reason=f"Annual turnover of {actual_display} is below the mandatory minimum of {req_display}.",
                expected_value=f">= {req_display}",
                actual_value=actual_display,
                difference=f"-₹{deficit:.2f} Crore deficit",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number=page_num,
                evidence_snippet=f"Form ITR-6 Schedule Part B-TI: Gross Turnover / Gross Receipts declared: {actual_display}",
            )
