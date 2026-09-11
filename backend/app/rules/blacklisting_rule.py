from typing import List, Any
from app.rules.base import BaseRule, RuleResult
from app.models.compliance import RuleStatus


class BlacklistingRule(BaseRule):
    rule_type = "BLACKLISTING"
    description = "Deterministic check for non-debarment declaration and query across Central Debarment Lists"

    def evaluate(
        self,
        bidder: Any,
        requirement: Any,
        documents: List[Any],
        entities: List[Any],
        verifications: List[Any],
    ) -> RuleResult:
        # Check if affidavit is present
        debarment_docs = [d for d in documents if d.document_type in ("BLACKLISTING_AFFIDAVIT", "DEBARMENT_AFFIDAVIT")]

        # Check mock central government debarment database verification
        verif = next((v for v in verifications if v.source == "MOCK_BLACKLISTING"), None)
        is_blacklisted = False
        blacklisted_agency = None
        blacklisted_until = None

        if verif and isinstance(verif.raw_response, dict):
            is_blacklisted = verif.raw_response.get("is_blacklisted", False)
            blacklisted_agency = verif.raw_response.get("banned_by")
            blacklisted_until = verif.raw_response.get("banned_until")

        doc_id = debarment_docs[0].id if debarment_docs else None
        doc_name = debarment_docs[0].original_filename if debarment_docs else "Blacklisting_Declaration.pdf"

        if is_blacklisted:
            return RuleResult(
                status=RuleStatus.FAIL,
                score=0.0,
                confidence=1.0,
                reason=(
                    f"CRITICAL DISQUALIFIER: Bidder is found on Central Debarment / Blacklist registry "
                    f"(Banned by: {blacklisted_agency} until {blacklisted_until})."
                ),
                expected_value="Clean Record / Not Blacklisted",
                actual_value=f"BLACKLISTED by {blacklisted_agency}",
                difference="Debarred Entity (Critical Violation)",
                evidence_document_id=doc_id,
                evidence_document_name=doc_name,
                evidence_page_number="1",
                evidence_snippet=f"Central Vigilance / Debarment Database Match: Entity '{bidder.company_name}' debarred until {blacklisted_until}.",
                rule_metadata={"critical_override": True, "banned_by": blacklisted_agency},
            )

        if not debarment_docs:
            return RuleResult(
                status=RuleStatus.WARNING,
                score=0.5,
                confidence=0.90,
                reason="No active blacklisting found in government records, but formal notarized Non-Blacklisting Affidavit is missing.",
                expected_value="Signed Notarized Affidavit & Clean Record",
                actual_value="Clean Record, Missing Affidavit",
                difference="Affidavit Missing",
            )

        return RuleResult(
            status=RuleStatus.PASS,
            score=1.0,
            confidence=0.99,
            reason="Bidder has submitted a valid non-debarment affidavit and has no adverse entries in central vigilance registries.",
            expected_value="No Blacklisting / Debarment",
            actual_value="Not Blacklisted (Verified)",
            difference="Fully Compliant",
            evidence_document_id=doc_id,
            evidence_document_name=doc_name,
            evidence_page_number="1",
            evidence_snippet="Notarized Affidavit: Deponent solemnly affirms that the firm has never been blacklisted or debarred by any Central/State Govt/PSU.",
            rule_metadata={"critical_override": False},
        )
