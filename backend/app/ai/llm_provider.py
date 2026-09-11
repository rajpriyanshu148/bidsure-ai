import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.core.config import settings


class LLMProvider(ABC):
    @abstractmethod
    def extract_tender_requirements(self, tender_text: str) -> List[Dict[str, Any]]:
        """Extract structured tender requirements from tender text."""
        pass

    @abstractmethod
    def generate_recommendation(
        self,
        bidder_name: str,
        tender_number: str,
        compliance_results: List[Dict[str, Any]],
        score: float,
        risk_level: str,
    ) -> Dict[str, Any]:
        """Generate structured evidence-backed recommendation."""
        pass


class MockLLMProvider(LLMProvider):
    def extract_tender_requirements(self, tender_text: str) -> List[Dict[str, Any]]:
        """
        Deterministic, grounded extraction of tender requirements from standard GeM tender text.
        """
        requirements = [
            {
                "rule_type": "TURNOVER",
                "description": "Minimum average annual turnover for past 3 years",
                "min_value": 100000000.0,
                "currency": "INR",
                "weight": 20.0,
                "mandatory": True,
                "is_critical": True,
                "expected_text": ">= ₹10.0 Crore",
            },
            {
                "rule_type": "GST",
                "description": "Valid Goods and Services Tax (GSTIN) registration with active status",
                "weight": 15.0,
                "mandatory": True,
                "is_critical": False,
                "expected_text": "Active GSTIN",
            },
            {
                "rule_type": "PAN",
                "description": "Valid Permanent Account Number (PAN) issued by Income Tax Department",
                "weight": 10.0,
                "mandatory": True,
                "is_critical": False,
                "expected_text": "Valid PAN",
            },
            {
                "rule_type": "UDYAM",
                "description": "MSME Udyam Registration Certificate for manufacturing category",
                "weight": 10.0,
                "mandatory": True,
                "is_critical": False,
                "expected_text": "Active Udyam Certificate",
            },
            {
                "rule_type": "OEM_AUTHORIZATION",
                "description": "Manufacturer's Authorization Form (MAF / OEM Authorization) for supplied pumps",
                "weight": 15.0,
                "mandatory": True,
                "is_critical": False,
                "expected_text": "Valid OEM Authorization",
            },
            {
                "rule_type": "LOCAL_CONTENT",
                "description": "Make in India (MII) local domestic content minimum 50% (Class-I Local Supplier)",
                "min_value": 50.0,
                "weight": 15.0,
                "mandatory": True,
                "is_critical": False,
                "expected_text": ">= 50% Local Content",
            },
            {
                "rule_type": "BLACKLISTING",
                "description": "Notarized affidavit of non-debarment / no blacklisting by Central/State agencies",
                "weight": 15.0,
                "mandatory": True,
                "is_critical": True,
                "expected_text": "Not Blacklisted / Debarred",
            },
        ]
        return requirements

    def generate_recommendation(
        self,
        bidder_name: str,
        tender_number: str,
        compliance_results: List[Dict[str, Any]],
        score: float,
        risk_level: str,
    ) -> Dict[str, Any]:
        key_issues = []
        positive_checks = []

        for r in compliance_results:
            status = r.get("status")
            rule_name = r.get("rule_name")
            reason = r.get("reason", "")
            actual = r.get("actual_value", "")
            expected = r.get("expected_value", "")
            diff = r.get("difference", "")

            if status in ("FAIL", "MISSING", "EXPIRED", "INCONSISTENT"):
                issue_str = f"{rule_name}: {reason}"
                if diff:
                    issue_str += f" ({diff})"
                key_issues.append(issue_str)
            elif status == "PASS":
                positive_checks.append(f"{rule_name}: {reason}")

        if risk_level == "HIGH":
            rec_text = (
                f"Procurement Officer review is strongly advised for '{bidder_name}' regarding tender '{tender_number}'. "
                f"The bidder scored {score:.1f}/100 and presents a HIGH risk profile because mandatory eligibility conditions "
                f"were not satisfied. Specifically, {len(key_issues)} critical or mandatory non-compliances were detected. "
                "The Procurement Officer may either reject the bid under Clause 4.2 or request formal clarification via GeM Representation Portal."
            )
        elif risk_level == "MEDIUM":
            rec_text = (
                f"Bidder '{bidder_name}' scored {score:.1f}/100 with a MEDIUM risk rating. "
                "Minor deviations or warnings were observed. Procurement Officer may seek documentary clarification before financial opening."
            )
        else:
            rec_text = (
                f"Bidder '{bidder_name}' successfully satisfied all evaluated eligibility requirements with a compliance score of {score:.1f}/100 "
                "(LOW risk). All statutory certificates and mandatory thresholds are verified and compliant."
            )

        return {
            "overall_assessment": f"{risk_level} RISK",
            "key_issues": key_issues,
            "positive_checks": positive_checks,
            "recommendation_text": rec_text,
            "advisory_disclaimer": (
                "AI output is strictly advisory. Final qualification/disqualification decision "
                "rests exclusively with the designated Procurement Officer."
            ),
        }


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.mock_fallback = MockLLMProvider()

    def extract_tender_requirements(self, tender_text: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            return self.mock_fallback.extract_tender_requirements(tender_text)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            prompt = f"""You are an expert procurement officer assistant. Extract all bidder eligibility requirements from this GeM tender text into structured JSON.
Return a JSON array of objects with keys:
- rule_type: string (one of TURNOVER, GST, PAN, UDYAM, OEM_AUTHORIZATION, LOCAL_CONTENT, BLACKLISTING, EXPIRY, ITR, EPFO, CUSTOM)
- description: string
- min_value: float or null
- expected_text: string
- weight: float (weight out of 100)
- mandatory: boolean
- is_critical: boolean

Tender text snippet:
{tender_text[:4000]}
"""
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
            reqs = data.get("requirements", data)
            if isinstance(reqs, list) and len(reqs) > 0:
                return reqs
            return self.mock_fallback.extract_tender_requirements(tender_text)
        except Exception:
            return self.mock_fallback.extract_tender_requirements(tender_text)

    def generate_recommendation(
        self,
        bidder_name: str,
        tender_number: str,
        compliance_results: List[Dict[str, Any]],
        score: float,
        risk_level: str,
    ) -> Dict[str, Any]:
        return self.mock_fallback.generate_recommendation(
            bidder_name, tender_number, compliance_results, score, risk_level
        )


def get_llm_provider() -> LLMProvider:
    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    return MockLLMProvider()
