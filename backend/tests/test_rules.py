import pytest
from app.rules.turnover_rule import TurnoverRule
from app.rules.gst_rule import GSTRule
from app.rules.pan_rule import PANRule
from app.rules.udyam_rule import UdyamRule
from app.rules.oem_rule import OEMRule
from app.rules.local_content_rule import LocalContentRule
from app.rules.blacklisting_rule import BlacklistingRule
from app.rules.expiry_rule import DocumentExpiryRule
from app.rules.entity_consistency_rule import EntityConsistencyRule, normalize_entity_name, calculate_similarity
from app.models.compliance import RuleStatus
from app.models.tender import TenderRequirement
from app.models.document import Document, ExtractedEntity
from app.models.verification import GovernmentVerification


class DummyBidder:
    def __init__(self, name="ABC Engineering Private Limited", pan="AAACA1234F", gstin="03AAACA1234F1Z5", udyam="UDYAM-PB-12-0012345"):
        self.company_name = name
        self.pan = pan
        self.gstin = gstin
        self.udyam_number = udyam
        self.submitted_at = None


def test_turnover_rule_fail():
    rule = TurnoverRule()
    bidder = DummyBidder()
    req = TenderRequirement(rule_type="TURNOVER", description="Min turnover ₹10 Cr", min_value=100000000.0, mandatory=True)
    doc = Document(id="doc1", document_type="ITR", original_filename="ITR_AY2025.pdf")
    entity = ExtractedEntity(
        entity_type="TURNOVER",
        raw_value="₹7.80 Crore",
        normalized_value="78000000.0",
        confidence=0.97,
        document_id="doc1",
        page_number=8,
    )

    res = rule.evaluate(bidder, req, [doc], [entity], [])
    assert res.status == RuleStatus.FAIL
    assert res.score == 0.0
    assert "₹7.80 Crore" in res.actual_value
    assert "deficit" in res.difference
    assert res.evidence_page_number == "8"


def test_turnover_rule_pass():
    rule = TurnoverRule()
    bidder = DummyBidder()
    req = TenderRequirement(rule_type="TURNOVER", description="Min turnover ₹10 Cr", min_value=100000000.0, mandatory=True)
    doc = Document(id="doc1", document_type="ITR", original_filename="ITR_AY2025.pdf")
    entity = ExtractedEntity(
        entity_type="TURNOVER",
        raw_value="₹12.50 Crore",
        normalized_value="125000000.0",
        confidence=0.98,
        document_id="doc1",
        page_number=8,
    )

    res = rule.evaluate(bidder, req, [doc], [entity], [])
    assert res.status == RuleStatus.PASS
    assert res.score == 1.0
    assert "surplus" in res.difference


def test_gst_rule_pass():
    rule = GSTRule()
    bidder = DummyBidder(gstin="03AAACA1234F1Z5")
    req = TenderRequirement(rule_type="GST", description="Active GSTIN", mandatory=True)
    doc = Document(id="doc_gst", document_type="GST_CERTIFICATE", original_filename="GST.pdf")
    entity = ExtractedEntity(
        entity_type="GSTIN",
        raw_value="03AAACA1234F1Z5",
        normalized_value="03AAACA1234F1Z5",
        confidence=0.99,
        document_id="doc_gst",
        page_number=1,
    )
    verif = GovernmentVerification(
        source="MOCK_GSTN",
        query_param="03AAACA1234F1Z5",
        status="SUCCESS",
        raw_response={"status": "ACTIVE", "returns_compliant": True},
    )

    res = rule.evaluate(bidder, req, [doc], [entity], [verif])
    assert res.status == RuleStatus.PASS
    assert res.score == 1.0


def test_gst_rule_invalid_format():
    rule = GSTRule()
    bidder = DummyBidder(gstin="INVALID_GSTIN_123")
    req = TenderRequirement(rule_type="GST", description="Active GSTIN", mandatory=True)
    doc = Document(id="doc_gst", document_type="GST_CERTIFICATE", original_filename="GST.pdf")
    entity = ExtractedEntity(
        entity_type="GSTIN",
        raw_value="INVALID_GSTIN_123",
        normalized_value="INVALID_GSTIN_123",
        confidence=0.99,
        document_id="doc_gst",
    )

    res = rule.evaluate(bidder, req, [doc], [entity], [])
    assert res.status == RuleStatus.FAIL
    assert "Invalid Format" in res.difference


def test_oem_rule_missing():
    rule = OEMRule()
    bidder = DummyBidder()
    req = TenderRequirement(rule_type="OEM_AUTHORIZATION", description="OEM Authorization Form", mandatory=True)
    # No OEM document passed
    res = rule.evaluate(bidder, req, [], [], [])
    assert res.status == RuleStatus.MISSING
    assert res.score == 0.0


def test_local_content_rule_fail():
    rule = LocalContentRule()
    bidder = DummyBidder()
    req = TenderRequirement(rule_type="LOCAL_CONTENT", description="Min 50% local content", min_value=50.0, mandatory=True)
    doc = Document(id="doc_mii", document_type="MAKE_IN_INDIA", original_filename="MakeInIndia.pdf")
    entity = ExtractedEntity(
        entity_type="LOCAL_CONTENT_PCT",
        raw_value="48%",
        normalized_value="48.0",
        confidence=0.95,
        document_id="doc_mii",
        page_number=3,
    )

    res = rule.evaluate(bidder, req, [doc], [entity], [])
    assert res.status == RuleStatus.FAIL
    assert res.score == 0.0
    assert "48.0%" in res.actual_value
    assert "deficit" in res.difference
    assert res.evidence_page_number == "3"


def test_blacklisting_rule():
    rule = BlacklistingRule()
    bidder = DummyBidder()
    req = TenderRequirement(rule_type="BLACKLISTING", description="No Debarment", mandatory=True)
    doc = Document(id="doc_bl", document_type="BLACKLISTING_AFFIDAVIT", original_filename="Affidavit.pdf")

    # Clean verification
    verif_clean = GovernmentVerification(
        source="MOCK_BLACKLISTING",
        query_param="ABC",
        raw_response={"is_blacklisted": False},
    )
    res_clean = rule.evaluate(bidder, req, [doc], [], [verif_clean])
    assert res_clean.status == RuleStatus.PASS
    assert res_clean.score == 1.0

    # Blacklisted verification
    verif_banned = GovernmentVerification(
        source="MOCK_BLACKLISTING",
        query_param="ABC",
        raw_response={"is_blacklisted": True, "banned_by": "Ministry of Defence", "banned_until": "2027-01-01"},
    )
    res_banned = rule.evaluate(bidder, req, [doc], [], [verif_banned])
    assert res_banned.status == RuleStatus.FAIL
    assert res_banned.score == 0.0
    assert res_banned.rule_metadata.get("critical_override") is True


def test_entity_consistency_normalization():
    name1 = "ABC ENGINEERING PVT. LTD."
    name2 = "ABC Engineering Private Limited"
    assert normalize_entity_name(name1) == "ABC ENGINEERING PRIVATE LIMITED"
    assert normalize_entity_name(name2) == "ABC ENGINEERING PRIVATE LIMITED"
    assert calculate_similarity(name1, name2) == 1.0


def test_entity_consistency_mismatch():
    name1 = "ABC Engineering Private Limited"
    name2 = "XYZ Turbines Corporation"
    sim = calculate_similarity(name1, name2)
    assert sim < 0.50
