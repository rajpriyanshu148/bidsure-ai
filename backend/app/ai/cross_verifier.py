import re
from difflib import SequenceMatcher
from typing import Dict, Any, List


class CrossDocumentVerifier:
    @staticmethod
    def normalize_company_name(name: str) -> str:
        if not name:
            return ""
        text = name.upper()
        # Legal suffix expansions
        text = re.sub(r"\bPVT\.?\b", "PRIVATE", text)
        text = re.sub(r"\bLTD\.?\b", "LIMITED", text)
        text = re.sub(r"\bCORP\.?\b", "CORPORATION", text)
        text = re.sub(r"\bCO\.?\b", "COMPANY", text)
        text = re.sub(r"\bINC\.?\b", "INCORPORATED", text)
        # Remove punctuation & extra whitespace
        text = re.sub(r"[^\w\s]", " ", text)
        return re.sub(r"\s+", " ", text).strip()

    def compare_names(self, name_a: str, name_b: str) -> Dict[str, Any]:
        norm_a = self.normalize_company_name(name_a)
        norm_b = self.normalize_company_name(name_b)

        if not norm_a or not norm_b:
            return {"similarity": 0.0, "match_type": "EMPTY", "is_match": False}

        if norm_a == norm_b:
            return {
                "similarity": 1.0,
                "match_type": "EXACT_NORMALIZED",
                "is_match": True,
                "explanation": "Names match exactly after standard legal abbreviation normalization.",
            }

        # Token set comparison
        tokens_a = set(norm_a.split())
        tokens_b = set(norm_b.split())
        token_jaccard = len(tokens_a.intersection(tokens_b)) / len(tokens_a.union(tokens_b))

        # Sequence matcher ratio
        seq_ratio = SequenceMatcher(None, norm_a, norm_b).ratio()

        combined_score = round(max(seq_ratio, token_jaccard), 2)

        if combined_score >= 0.88:
            return {
                "similarity": combined_score,
                "match_type": "HIGH_SIMILARITY",
                "is_match": True,
                "explanation": f"High degree of matching ({combined_score * 100:.0f}%). Minor spelling or token permutation.",
            }
        elif combined_score >= 0.70:
            return {
                "similarity": combined_score,
                "match_type": "MODERATE_VARIATION",
                "is_match": False,
                "explanation": f"Moderate variation ({combined_score * 100:.0f}%). Manual officer review recommended.",
            }
        else:
            return {
                "similarity": combined_score,
                "match_type": "MISMATCH",
                "is_match": False,
                "explanation": f"Significant mismatch ({combined_score * 100:.0f}% similarity). Likely different legal entities.",
            }


cross_verifier = CrossDocumentVerifier()
