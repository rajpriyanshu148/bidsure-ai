from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.integrations.base import GovernmentVerificationProvider


class MockGSTProvider(GovernmentVerificationProvider):
    source_name = "MOCK_GSTN"
    description = "Simulated Goods and Services Tax Network (GSTN) verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        gstin = query_param.strip().upper()
        # Simulated responses
        if "INACTIVE" in gstin or gstin.endswith("999"):
            return {
                "source": self.source_name,
                "is_simulated": True,
                "gstin": gstin,
                "status": "CANCELLED",
                "legal_name": "Defunct Traders Private Limited",
                "trade_name": "Defunct Traders",
                "registration_date": "2018-01-10",
                "cancellation_date": "2024-05-12",
                "taxpayer_type": "Regular",
                "returns_compliant": False,
                "jurisdiction": "State - Ward 4, Punjab",
                "message": "Registration cancelled due to non-filing of returns for continuous 6 months.",
            }

        return {
            "source": self.source_name,
            "is_simulated": True,
            "gstin": gstin,
            "status": "ACTIVE",
            "legal_name": "ABC Engineering Private Limited" if "1234" in gstin else "Verified Registered Vendor",
            "trade_name": "ABC Engineering Works",
            "registration_date": "2020-04-15",
            "taxpayer_type": "Regular",
            "returns_compliant": True,
            "last_return_filed": "GSTR-3B (January 2026)",
            "jurisdiction": "State - Industrial Area Unit, Ludhiana, Punjab",
            "einvoice_status": "Enabled",
        }


class MockPANProvider(GovernmentVerificationProvider):
    source_name = "MOCK_CBDT_PAN"
    description = "Simulated Income Tax Department / CBDT PAN verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        pan = query_param.strip().upper()
        return {
            "source": self.source_name,
            "is_simulated": True,
            "pan": pan,
            "status": "VALID",
            "legal_name": "ABC ENGINEERING PRIVATE LIMITED" if "1234" in pan else "VERIFIED ENTERPRISE",
            "pan_category": "Company" if len(pan) >= 4 and pan[3] == "C" else "Firm",
            "aadhaar_seeding_status": "Not Applicable for Companies",
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }


class MockUdyamProvider(GovernmentVerificationProvider):
    source_name = "MOCK_UDYAM"
    description = "Simulated Ministry of MSME Udyam Registration Portal verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        udyam = query_param.strip().upper()
        return {
            "source": self.source_name,
            "is_simulated": True,
            "udyam_number": udyam,
            "status": "ACTIVE",
            "enterprise_name": "ABC Engineering Private Limited",
            "enterprise_type": "Medium Enterprise",
            "major_activity": "Manufacturing",
            "nic_code": "28131 - Manufacture of pumps and compressors",
            "incorporation_date": "2019-11-20",
            "state": "Punjab",
            "district": "Ludhiana",
        }


class MockIncomeTaxProvider(GovernmentVerificationProvider):
    source_name = "MOCK_INCOME_TAX"
    description = "Simulated Central Board of Direct Taxes (CBDT) ITR Verification Service"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "pan": query_param,
            "status": "VERIFIED",
            "filing_history": [
                {"ay": "2024-25", "itr_form": "ITR-6", "acknowledgment_no": "987654321012345", "turnover_inr": 78000000.0, "status": "Processed"},
                {"ay": "2023-24", "itr_form": "ITR-6", "acknowledgment_no": "987654321012344", "turnover_inr": 72000000.0, "status": "Processed"},
                {"ay": "2022-23", "itr_form": "ITR-6", "acknowledgment_no": "987654321012343", "turnover_inr": 65000000.0, "status": "Processed"},
            ],
            "average_annual_turnover_inr": 71666666.67,
        }


class MockMCAProvider(GovernmentVerificationProvider):
    source_name = "MOCK_MCA"
    description = "Simulated Ministry of Corporate Affairs (MCA21) Company Information adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        cin = query_param.strip().upper()
        return {
            "source": self.source_name,
            "is_simulated": True,
            "cin": cin,
            "company_name": "ABC ENGINEERING PRIVATE LIMITED",
            "company_status": "Active",
            "incorporation_date": "2019-10-14",
            "roc_office": "RoC-Chandigarh",
            "authorized_capital_inr": 50000000.0,
            "paid_up_capital_inr": 35000000.0,
            "directors": [
                {"din": "01234567", "name": "Rajesh Sharma", "designation": "Director"},
                {"din": "07654321", "name": "Sunil Verma", "designation": "Managing Director"},
            ],
        }


class MockBlacklistingProvider(GovernmentVerificationProvider):
    source_name = "MOCK_BLACKLISTING"
    description = "Simulated Central Debarment / CVC / GeM Blacklisting Registry adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        name_or_pan = query_param.strip().upper()
        # Simulate blacklisting if query specifically matches test case
        if "ZENITH" in name_or_pan or "BLACKLISTED" in name_or_pan or "DEBARRED" in name_or_pan:
            return {
                "source": self.source_name,
                "is_simulated": True,
                "query": query_param,
                "is_blacklisted": True,
                "banned_by": "Ministry of Defence / Central Vigilance Commission",
                "order_number": "CVC/DEB/2024/889",
                "banned_from": "2024-03-01",
                "banned_until": "2027-02-28",
                "reason": "Submission of forged test certificates in public procurement tender.",
                "category": "All Central Public Sector Undertakings and Ministries",
            }

        return {
            "source": self.source_name,
            "is_simulated": True,
            "query": query_param,
            "is_blacklisted": False,
            "banned_by": None,
            "banned_until": None,
            "status": "CLEAR",
            "remarks": "No debarment, ban or blacklisting record found in Central Vigilance Commission database.",
        }


class MockEPFOProvider(GovernmentVerificationProvider):
    source_name = "MOCK_EPFO"
    description = "Simulated Employees' Provident Fund Organisation employer status adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "establishment_code": query_param,
            "status": "ACTIVE",
            "establishment_name": "ABC ENGINEERING PRIVATE LIMITED",
            "total_contributing_members": 48,
            "ecr_compliance": "Current up to last wage month",
        }


class MockESICProvider(GovernmentVerificationProvider):
    source_name = "MOCK_ESIC"
    description = "Simulated Employees' State Insurance Corporation employer status adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "employer_code": query_param,
            "status": "ACTIVE",
            "employer_name": "ABC ENGINEERING PRIVATE LIMITED",
            "active_insured_persons": 32,
            "last_payment_date": "2026-02-12",
        }


class MockStartupIndiaProvider(GovernmentVerificationProvider):
    source_name = "MOCK_STARTUP_INDIA"
    description = "Simulated DPIIT Startup India recognition adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "dpiit_number": query_param,
            "status": "RECOGNIZED",
            "entity_name": "Bharat Tech Solutions Private Limited",
            "recognition_date": "2023-08-11",
            "tax_exemption_status": "Eligible under 80-IAC",
        }


class MockNSICProvider(GovernmentVerificationProvider):
    source_name = "MOCK_NSIC"
    description = "Simulated National Small Industries Corporation (NSIC) verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "certificate_number": query_param,
            "status": "VALID",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "valid_until": "2027-06-30",
        }


class MockDigiLockerProvider(GovernmentVerificationProvider):
    source_name = "MOCK_DIGILOCKER"
    description = "Simulated DigiLocker Document Authenticity / Hash Verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "doc_hash": query_param,
            "cryptographic_verification": "SUCCESS",
            "issuer_id": "IN.GOV.UIDAI / IN.GOV.CBDT",
            "signature_status": "Digitally Signed & Certified",
        }


class MockMakeInIndiaProvider(GovernmentVerificationProvider):
    source_name = "MOCK_MAKE_IN_INDIA"
    description = "Simulated DPIIT Make in India portal verification adapter"

    def verify(self, query_param: str) -> Dict[str, Any]:
        return {
            "source": self.source_name,
            "is_simulated": True,
            "supplier_class": "Class-II Local Supplier" if "48" in query_param else "Class-I Local Supplier",
            "local_content_percentage": 48.0 if "48" in query_param else 65.0,
            "auditor_verified": True,
        }


# Adapter Registry
GOVERNMENT_PROVIDERS: Dict[str, GovernmentVerificationProvider] = {
    "MOCK_GSTN": MockGSTProvider(),
    "MOCK_CBDT_PAN": MockPANProvider(),
    "MOCK_UDYAM": MockUdyamProvider(),
    "MOCK_INCOME_TAX": MockIncomeTaxProvider(),
    "MOCK_MCA": MockMCAProvider(),
    "MOCK_BLACKLISTING": MockBlacklistingProvider(),
    "MOCK_EPFO": MockEPFOProvider(),
    "MOCK_ESIC": MockESICProvider(),
    "MOCK_STARTUP_INDIA": MockStartupIndiaProvider(),
    "MOCK_NSIC": MockNSICProvider(),
    "MOCK_DIGILOCKER": MockDigiLockerProvider(),
    "MOCK_MAKE_IN_INDIA": MockMakeInIndiaProvider(),
}


def get_government_provider(source_name: str) -> Optional[GovernmentVerificationProvider]:
    return GOVERNMENT_PROVIDERS.get(source_name)
