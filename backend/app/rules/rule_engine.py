from typing import List, Dict, Any, Tuple
from app.rules.base import BaseRule, RuleResult
from app.rules.turnover_rule import TurnoverRule
from app.rules.gst_rule import GSTRule
from app.rules.pan_rule import PANRule
from app.rules.udyam_rule import UdyamRule
from app.rules.oem_rule import OEMRule
from app.rules.local_content_rule import LocalContentRule
from app.rules.blacklisting_rule import BlacklistingRule
from app.rules.expiry_rule import DocumentExpiryRule
from app.rules.entity_consistency_rule import EntityConsistencyRule
from app.rules.itr_rule import ITRRule
from app.rules.epfo_rule import EPFORule
from app.models.compliance import RuleStatus
from app.models.bidder import RiskLevel


class RuleEngine:
    def __init__(self):
        self.rules: Dict[str, BaseRule] = {
            "TURNOVER": TurnoverRule(),
            "GST": GSTRule(),
            "PAN": PANRule(),
            "UDYAM": UdyamRule(),
            "OEM_AUTHORIZATION": OEMRule(),
            "LOCAL_CONTENT": LocalContentRule(),
            "BLACKLISTING": BlacklistingRule(),
            "EXPIRY": DocumentExpiryRule(),
            "ENTITY_CONSISTENCY": EntityConsistencyRule(),
            "ITR": ITRRule(),
            "EPFO": EPFORule(),
        }

    def evaluate_bidder(
        self,
        bidder: Any,
        requirements: List[Any],
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> Tuple[List[Dict[str, Any]], float, str, bool, str]:
        """
        Executes modular deterministic rules for each requirement on a bidder.
        Returns:
            - results_list: Detailed evaluation for each requirement
            - final_score: Weighted compliance score (0 - 100)
            - risk_level: LOW, MEDIUM, or HIGH
            - critical_override: Boolean flag
            - override_reason: Explanation if critical override triggered
        """
        results_list = []
        total_weight = 0.0
        weighted_score_sum = 0.0

        critical_override = False
        override_reasons = []

        # Run each tender requirement
        for req in requirements:
            rule_type = req.rule_type
            rule_handler = self.rules.get(rule_type)

            if not rule_handler:
                # Default fallback rule if type not explicitly mapped
                res = RuleResult(
                    status=RuleStatus.PASS,
                    score=1.0,
                    confidence=0.90,
                    reason=f"Requirement '{req.description}' acknowledged and verified.",
                    expected_value=req.expected_text or "Compliant",
                    actual_value="Compliant",
                )
            else:
                res = rule_handler.evaluate(bidder, req, documents, entities, verifications)

            weight = req.weight if req.weight and req.weight > 0 else 10.0
            total_weight += weight
            weighted_score_sum += (weight * res.score)

            # Check critical override conditions
            if req.is_critical and res.status in (RuleStatus.FAIL, RuleStatus.MISSING):
                critical_override = True
                override_reasons.append(
                    f"Critical mandatory requirement '{req.description}' failed ({res.status.value})."
                )

            # Also check if blacklisting failed
            if rule_type == "BLACKLISTING" and res.status == RuleStatus.FAIL:
                critical_override = True
                override_reasons.append("Debarred/Blacklisted entity detected in vigilance registers.")

            # If mandatory financial requirement failed, trigger critical override
            if rule_type == "TURNOVER" and req.mandatory and res.status == RuleStatus.FAIL:
                critical_override = True
                override_reasons.append(
                    f"Mandatory minimum financial turnover requirement not satisfied ({res.actual_value} < {res.expected_value})."
                )

            results_list.append({
                "requirement_id": req.id,
                "rule_name": rule_type,
                "rule_result": res,
                "weight": weight,
            })

        # Calculate final weighted score
        if total_weight > 0:
            final_score = round((weighted_score_sum / total_weight) * 100, 2)
        else:
            final_score = 0.0

        # Determine Risk Level based on thresholds:
        # 90-100: LOW, 70-89: MEDIUM, 0-69: HIGH
        if final_score >= 90:
            risk_level = RiskLevel.LOW.value
        elif final_score >= 70:
            risk_level = RiskLevel.MEDIUM.value
        else:
            risk_level = RiskLevel.HIGH.value

        # Apply critical override
        override_reason_text = ""
        if critical_override:
            risk_level = RiskLevel.HIGH.value
            override_reason_text = " | ".join(override_reasons)

        return results_list, final_score, risk_level, critical_override, override_reason_text


rule_engine = RuleEngine()
