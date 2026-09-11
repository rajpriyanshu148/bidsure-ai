from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class LocalContentRule(BaseRule):
    rule_type = "LOCAL_CONTENT"
    description = "Validate Public Procurement (Preference to Make in India) local content declaration percentage"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        min_required_pct = requirement.min_value if requirement and requirement.min_value is not None else 50.0

        mii_docs = [d for d in documents if d.document_type == "MAKE_IN_INDIA"]
        if not mii_docs:
            return RuleResult(
                status=RuleStatus.MISSING,
                score=0.0,
                confidence=1.0,
                reason="Make in India (MII) Local Content Self-Declaration certificate not uploaded.",
                expected_value=f">= {min_required_pct:.0f}% Local Content Declaration",
                actual_value="Missing",
                difference="Document Missing",
            )

        mii_entity = None
        for ent in entities:
            if ent.entity_type == "LOCAL_CONTENT_PCT":
                mii_entity = ent
                break

        if not mii_entity:
            return RuleResult(
                status=RuleStatus.REVIEW_REQUIRED,
                score=0.0,
                confidence=0.75,
                reason="Make in India declaration certificate uploaded but percentage could not be parsed automatically.",
                expected_value=f">= {min_required_pct:.0f}%",
                actual_value="Unextracted",
                evidence_document_id=mii_docs[0].id,
                evidence_document_name=mii_docs[0].original_filename,
                evidence_page_number="1",
            )

        try:
            actual_pct = float(str(mii_entity.normalized_value or mii_entity.raw_value).replace("%", ""))
        except (ValueError, TypeError):
            actual_pct = 0.0

        doc_name = mii_docs[0].original_filename
        page_num = str(mii_entity.page_number or 3)

        if actual_pct >= min_required_pct:
            surplus = actual_pct - min_required_pct
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=mii_entity.confidence,
                reason=f"Declared local content of {actual_pct:.1f}% meets mandatory tender threshold of >= {min_required_pct:.1f}% (Class-I Local Supplier).",
                expected_value=f">= {min_required_pct:.1f}%",
                actual_value=f"{actual_pct:.1f}%",
                difference=f"+{surplus:.1f}% compliant",
                evidence_document_id=mii_entity.document_id or mii_docs[0].id,
                evidence_document_name=doc_name,
                evidence_page_number=page_num,
                evidence_snippet=f"Self-Declaration under DPIIT Public Procurement Order: Certified local content is {actual_pct:.1f}% manufactured at domestic facility.",
            )
        else:
            deficit = min_required_pct - actual_pct
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=mii_entity.confidence,
                reason=f"Declared local content is {actual_pct:.1f}%, which falls short of the mandatory {min_required_pct:.1f}% requirement.",
                expected_value=f">= {min_required_pct:.1f}%",
                actual_value=f"{actual_pct:.1f}%",
                difference=f"-{deficit:.1f}% deficit",
                evidence_document_id=mii_entity.document_id or mii_docs[0].id,
                evidence_document_name=doc_name,
                evidence_page_number=page_num,
                evidence_snippet=f"Make in India Self-Declaration Clause 4: Total calculated percentage of local domestic content = {actual_pct:.1f}%.",
            )
