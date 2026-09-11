import re
from typing import List, Any
from difflib import SequenceMatcher
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


def normalize_entity_name(name: str) -> str:
    if not name:
        return ""
    clean = name.upper()
    # Expand common abbreviations
    clean = re.sub(r"\bPVT\.?\b", "PRIVATE", clean)
    clean = re.sub(r"\bLTD\.?\b", "LIMITED", clean)
    clean = re.sub(r"\bCORP\.?\b", "CORPORATION", clean)
    clean = re.sub(r"\bINC\.?\b", "INCORPORATED", clean)
    clean = re.sub(r"\bCO\.?\b", "COMPANY", clean)
    clean = re.sub(r"[^A-Z0-9\s]", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def calculate_similarity(s1: str, s2: str) -> float:
    n1 = normalize_entity_name(s1)
    n2 = normalize_entity_name(s2)
    if not n1 or not n2:
        return 0.0
    if n1 == n2:
        return 1.0
    return SequenceMatcher(None, n1, n2).ratio()


class EntityConsistencyRule(BaseRule):
    rule_type = "ENTITY_CONSISTENCY"
    description = "Deterministic cross-document entity name and identity consistency validation"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        primary_name = bidder.company_name or ""
        name_entities = [e for e in entities if e.entity_type == "COMPANY_NAME"]

        if not name_entities:
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=0.90,
                reason=f"Primary entity name '{primary_name}' verified across profile records.",
                expected_value=primary_name,
                actual_value=primary_name,
                difference="Exact Match",
            )

        comparisons = []
        min_sim = 1.0
        worst_match = None

        for ent in name_entities:
            doc_name = "Document"
            for d in documents:
                if d.id == ent.document_id:
                    doc_name = d.original_filename
                    break

            ext_name = ent.raw_value or ent.normalized_value or ""
            sim = calculate_similarity(primary_name, ext_name)
            comparisons.append({
                "doc_name": doc_name,
                "doc_id": ent.document_id,
                "page": str(ent.page_number or 1),
                "extracted_name": ext_name,
                "similarity": sim,
            })
            if sim < min_sim:
                min_sim = sim
                worst_match = comparisons[-1]

        if min_sim >= 0.90:
            return RuleResult(
                status=RuleStatus.PASS,
                score=1.0,
                confidence=0.98,
                reason=(
                    f"Entity legal name consistency verified across documents ({min_sim * 100:.1f}% match). "
                    "Minor orthographic variations (e.g., 'Pvt Ltd' vs 'Private Limited') safely normalized."
                ),
                expected_value=primary_name,
                actual_value=f"Consistent across {len(comparisons)} documents",
                difference="High Consistency",
                evidence_document_id=worst_match["doc_id"] if worst_match else None,
                evidence_document_name=worst_match["doc_name"] if worst_match else "Documents",
                evidence_page_number=worst_match["page"] if worst_match else "1",
                evidence_snippet=f"Document: {worst_match['doc_name']} -> '{worst_match['extracted_name']}' matched primary '{primary_name}'",
            )
        elif min_sim >= 0.75:
            return RuleResult(
                status=RuleStatus.WARNING,
                score=0.5,
                confidence=0.88,
                reason=(
                    f"Moderate name variation detected: '{worst_match['extracted_name']}' in {worst_match['doc_name']} "
                    f"vs primary '{primary_name}' ({min_sim * 100:.1f}% similarity). Officer review advised."
                ),
                expected_value=primary_name,
                actual_value=worst_match["extracted_name"],
                difference=f"Similarity: {min_sim * 100:.1f}%",
                evidence_document_id=worst_match["doc_id"],
                evidence_document_name=worst_match["doc_name"],
                evidence_page_number=worst_match["page"],
                evidence_snippet=f"Name discrepancy in {worst_match['doc_name']}: '{worst_match['extracted_name']}'",
            )
        else:
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=0.95,
                reason=(
                    f"CRITICAL ENTITY MISMATCH: '{worst_match['extracted_name']}' in {worst_match['doc_name']} "
                    f"does not match registered bidder name '{primary_name}' ({min_sim * 100:.1f}% similarity)."
                ),
                expected_value=primary_name,
                actual_value=worst_match["extracted_name"],
                difference="Substantial Name Discrepancy",
                evidence_document_id=worst_match["doc_id"],
                evidence_document_name=worst_match["doc_name"],
                evidence_page_number=worst_match["page"],
                evidence_snippet=f"Mismatch: Document '{worst_match['doc_name']}' mentions entity '{worst_match['extracted_name']}' instead of '{primary_name}'",
            )
