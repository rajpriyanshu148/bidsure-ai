from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.compliance import RuleStatus


class RuleResult(BaseModel):
    status: RuleStatus
    score: float  # 1.0 = PASS, 0.5 = WARNING, 0.0 = FAIL/MISSING
    confidence: float = 0.95
    reason: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    difference: Optional[str] = None
    evidence_document_id: Optional[str] = None
    evidence_document_name: Optional[str] = None
    evidence_page_number: Optional[str] = None
    evidence_snippet: Optional[str] = None
    rule_metadata: Optional[Dict[str, Any]] = None


class BaseRule(ABC):
    rule_type: str
    description: str

    @abstractmethod
    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        """
        Evaluate bidder compliance against a specific requirement.
        Must return deterministic RuleResult with evidence.
        """
        pass
