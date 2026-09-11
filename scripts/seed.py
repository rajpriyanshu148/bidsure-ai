import os
import sys

# Add backend directory to sys.path so app modules can be imported
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderRequirement, TenderStatus
from app.models.bidder import Bidder, RiskLevel, VerificationStatus, OfficerDecisionStatus
from app.models.document import Document, DocumentPage, ExtractedEntity, DocumentType
from app.services.document_service import document_service, storage_provider
from app.services.compliance_service import compliance_service
from app.services.audit_service import audit_service


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        users_data = [
            {
                "email": "officer@bidsure.gov.in",
                "full_name": "Rajesh Kumar, GeM Procurement Officer",
                "role": UserRole.PROCUREMENT_OFFICER.value,
                "password": "Password@123",
            },
            {
                "email": "admin@bidsure.gov.in",
                "full_name": "Dr. A. Sharma, GeM System Administrator",
                "role": UserRole.ADMIN.value,
                "password": "Password@123",
            },
            {
                "email": "auditor@bidsure.gov.in",
                "full_name": "Sanjay Singhal, CAG Procurement Auditor",
                "role": UserRole.AUDITOR.value,
                "password": "Password@123",
            },
        ]

        created_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user_obj = User(
                    email=u["email"],
                    full_name=u["full_name"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                db.add(user_obj)
                db.commit()
                db.refresh(user_obj)
                created_users[u["role"]] = user_obj
                print(f"Created user: {u['email']} ({u['role']})")
            else:
                created_users[u["role"]] = existing

        officer = created_users.get(UserRole.PROCUREMENT_OFFICER.value)

        # 2. Seed Tenders
        tenders_data = [
            {
                "tender_number": "GEM/2026/B/DEMO001",
                "title": "Industrial Heavy-Duty Centrifugal Pump Procurement",
                "description": "Supply, installation, and commissioning of high-discharge industrial centrifugal pumps for state irrigation projects.",
                "category": "Machinery & Capital Equipment",
                "estimated_value": 450000000.0,  # ₹45 Cr
                "closing_date": datetime.now(timezone.utc) + timedelta(days=20),
                "status": TenderStatus.ACTIVE.value,
                "requirements": [
                    {
                        "rule_type": "TURNOVER",
                        "description": "Minimum average annual turnover for past 3 years",
                        "min_value": 100000000.0,  # ₹10 Crore
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
                        "description": "MSME Udyam Registration Certificate under Manufacturing category",
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
                ],
            },
            {
                "tender_number": "GEM/2026/B/DEMO002",
                "title": "Solar Photovoltaic Power Generating Modules and Inverters",
                "description": "Turnkey procurement of 10MW grid-connected solar power equipment and inverters.",
                "category": "Renewable Energy",
                "estimated_value": 850000000.0,
                "closing_date": datetime.now(timezone.utc) + timedelta(days=35),
                "status": TenderStatus.ACTIVE.value,
                "requirements": [
                    {
                        "rule_type": "TURNOVER",
                        "description": "Minimum annual turnover",
                        "min_value": 150000000.0,
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": True,
                        "expected_text": ">= ₹15.0 Crore",
                    },
                    {
                        "rule_type": "GST",
                        "description": "Valid GSTIN registration",
                        "weight": 20.0,
                        "mandatory": True,
                        "is_critical": False,
                        "expected_text": "Active GSTIN",
                    },
                    {
                        "rule_type": "LOCAL_CONTENT",
                        "description": "Local content percentage under ALMM",
                        "min_value": 60.0,
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": False,
                        "expected_text": ">= 60% Local Content",
                    },
                    {
                        "rule_type": "BLACKLISTING",
                        "description": "No blacklisting affidavit",
                        "weight": 30.0,
                        "mandatory": True,
                        "is_critical": True,
                        "expected_text": "Not Blacklisted",
                    },
                ],
            },
            {
                "tender_number": "GEM/2026/B/DEMO003",
                "title": "National Data Center Cloud Compute Infrastructure & Blade Servers",
                "description": "Procurement of high-density rack servers and enterprise SAN storage systems.",
                "category": "Information Technology",
                "estimated_value": 1200000000.0,
                "closing_date": datetime.now(timezone.utc) + timedelta(days=14),
                "status": TenderStatus.ACTIVE.value,
                "requirements": [
                    {
                        "rule_type": "TURNOVER",
                        "description": "Minimum annual turnover",
                        "min_value": 250000000.0,
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": True,
                        "expected_text": ">= ₹25.0 Crore",
                    },
                    {
                        "rule_type": "OEM_AUTHORIZATION",
                        "description": "OEM Authorization for blade servers",
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": True,
                        "expected_text": "Direct OEM Authorization",
                    },
                    {
                        "rule_type": "BLACKLISTING",
                        "description": "Clean record / no debarment",
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": True,
                        "expected_text": "Not Blacklisted",
                    },
                    {
                        "rule_type": "GST",
                        "description": "Active GSTIN",
                        "weight": 25.0,
                        "mandatory": True,
                        "is_critical": False,
                        "expected_text": "Active GSTIN",
                    },
                ],
            },
        ]

        created_tenders = {}
        for td in tenders_data:
            existing = db.query(Tender).filter(Tender.tender_number == td["tender_number"]).first()
            if not existing:
                t_obj = Tender(
                    tender_number=td["tender_number"],
                    title=td["title"],
                    description=td["description"],
                    category=td["category"],
                    estimated_value=td["estimated_value"],
                    closing_date=td["closing_date"],
                    status=td["status"],
                    created_by_id=officer.id if officer else None,
                )
                db.add(t_obj)
                db.commit()
                db.refresh(t_obj)

                for r in td["requirements"]:
                    req_obj = TenderRequirement(
                        tender_id=t_obj.id,
                        rule_type=r["rule_type"],
                        description=r["description"],
                        min_value=r.get("min_value"),
                        weight=r.get("weight", 10.0),
                        mandatory=r.get("mandatory", True),
                        is_critical=r.get("is_critical", False),
                        expected_text=r.get("expected_text"),
                    )
                    db.add(req_obj)
                db.commit()
                created_tenders[td["tender_number"]] = t_obj
                print(f"Created Tender: {td['tender_number']} with {len(td['requirements'])} requirements")
            else:
                created_tenders[td["tender_number"]] = existing

        demo_tender = created_tenders["GEM/2026/B/DEMO001"]

        # 3. Seed Bidders
        bidders_data = [
            {
                "company_name": "ABC Engineering Private Limited",
                "tender_id": demo_tender.id,
                "cin": "U28131PB2019PTC050123",
                "pan": "AAACA1234F",
                "gstin": "03AAACA1234F1Z5",
                "udyam_number": "UDYAM-PB-12-0012345",
                "contact_email": "bids@abcengineering.com",
                "contact_phone": "+91 98765 43210",
                "is_primary_demo": True,
            },
            {
                "company_name": "Apex Dynamics Private Limited",
                "tender_id": demo_tender.id,
                "cin": "U29100DL2015PTC028445",
                "pan": "AABCA9876G",
                "gstin": "07AABCA9876G1Z2",
                "udyam_number": "UDYAM-DL-02-0087654",
                "contact_email": "tenders@apexdynamics.in",
                "contact_phone": "+91 98111 22334",
                "is_primary_demo": False,
            },
            {
                "company_name": "Kaveri Heavy Industries Limited",
                "tender_id": demo_tender.id,
                "cin": "L29220KA2010PLC043219",
                "pan": "AAACK5432B",
                "gstin": "29AAACK5432B1Z8",
                "udyam_number": "UDYAM-KR-03-0054321",
                "contact_email": "procurement@kaveriheavy.com",
                "contact_phone": "+91 80 2345 6789",
                "is_primary_demo": False,
            },
            {
                "company_name": "Bharat Tech Solutions Private Limited",
                "tender_id": created_tenders["GEM/2026/B/DEMO002"].id,
                "cin": "U72200MH2021PTC099881",
                "pan": "AABCB6543C",
                "gstin": "27AABCB6543C1Z4",
                "udyam_number": "UDYAM-MH-19-0099881",
                "contact_email": "solar@bharattech.in",
                "contact_phone": "+91 98220 12345",
                "is_primary_demo": False,
            },
            {
                "company_name": "Zenith Global Corp",
                "tender_id": created_tenders["GEM/2026/B/DEMO003"].id,
                "cin": "U74999DL2018PTC087654",
                "pan": "AABCZ7777D",
                "gstin": "07AABCZ7777D1Z9",
                "udyam_number": "UDYAM-DL-08-0077777",
                "contact_email": "sales@zenithglobal.com",
                "contact_phone": "+91 99999 88888",
                "is_primary_demo": False,
            },
        ]

        created_bidders = {}
        for bd in bidders_data:
            existing = db.query(Bidder).filter(
                Bidder.company_name == bd["company_name"],
                Bidder.tender_id == bd["tender_id"],
            ).first()
            if not existing:
                b_obj = Bidder(
                    company_name=bd["company_name"],
                    tender_id=bd["tender_id"],
                    cin=bd["cin"],
                    pan=bd["pan"],
                    gstin=bd["gstin"],
                    udyam_number=bd["udyam_number"],
                    contact_email=bd["contact_email"],
                    contact_phone=bd["contact_phone"],
                    compliance_score=0.0,
                    risk_level=RiskLevel.LOW.value,
                    verification_status=VerificationStatus.PENDING.value,
                    officer_decision_status=OfficerDecisionStatus.PENDING.value,
                )
                db.add(b_obj)
                db.commit()
                db.refresh(b_obj)
                created_bidders[bd["company_name"]] = (b_obj, bd.get("is_primary_demo", False))
                print(f"Created Bidder: {bd['company_name']}")
            else:
                created_bidders[bd["company_name"]] = (existing, bd.get("is_primary_demo", False))

        # 4. Attach demo documents to primary demo bidder (ABC Engineering)
        abc_bidder, _ = created_bidders["ABC Engineering Private Limited"]
        demo_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))

        demo_files = [
            ("ABC_Eng_PAN.pdf", DocumentType.PAN_CARD.value),
            ("ABC_Eng_GST.pdf", DocumentType.GST_CERTIFICATE.value),
            ("ABC_Eng_Udyam.pdf", DocumentType.UDYAM_CERTIFICATE.value),
            ("ABC_Eng_ITR_AY2025.pdf", DocumentType.ITR.value),
            ("ABC_Eng_BalanceSheet.pdf", DocumentType.BALANCE_SHEET.value),
            ("ABC_Eng_MakeInIndia.pdf", DocumentType.MAKE_IN_INDIA.value),
            ("ABC_Eng_Blacklisting_Affidavit.pdf", DocumentType.BLACKLISTING_AFFIDAVIT.value),
        ]

        # Check existing documents for ABC
        existing_doc_count = db.query(Document).filter(Document.bidder_id == abc_bidder.id).count()
        if existing_doc_count == 0:
            for fname, dtype in demo_files:
                fpath = os.path.join(demo_data_dir, fname)
                if not os.path.exists(fpath):
                    continue

                with open(fpath, "rb") as f:
                    content = f.read()

                saved_path = storage_provider.save_file(fname, content)
                c_type, pages_data, entities_data = document_service.process_pdf(saved_path, fname)

                doc_obj = Document(
                    bidder_id=abc_bidder.id,
                    tender_id=demo_tender.id,
                    document_type=dtype,
                    original_filename=fname,
                    file_path=saved_path,
                    file_size=len(content),
                    mime_type="application/pdf",
                    total_pages=len(pages_data),
                    ocr_status="COMPLETED",
                    raw_text="\n".join([p["text_content"] for p in pages_data]),
                )
                db.add(doc_obj)
                db.commit()
                db.refresh(doc_obj)

                for p in pages_data:
                    p_obj = DocumentPage(
                        document_id=doc_obj.id,
                        page_number=p["page_number"],
                        text_content=p["text_content"],
                        has_images=p.get("has_images", False),
                    )
                    db.add(p_obj)

                for ent in entities_data:
                    ent_obj = ExtractedEntity(
                        document_id=doc_obj.id,
                        bidder_id=abc_bidder.id,
                        entity_type=ent["entity_type"],
                        raw_value=ent["raw_value"],
                        normalized_value=ent.get("normalized_value"),
                        confidence=ent.get("confidence", 0.90),
                        page_number=ent.get("page_number", 1),
                    )
                    db.add(ent_obj)
                db.commit()
                print(f"Attached document to ABC Engineering: {fname}")

        # 5. Run full verification on ABC Engineering to pre-populate results
        print("Running full verification on demo bidder (ABC Engineering)...")
        res = compliance_service.run_full_verification(
            db=db,
            bidder_id=abc_bidder.id,
            user_id=officer.id if officer else None,
            user_email=officer.email if officer else "system@bidsure.gov.in",
        )
        print(f"Verification result: Score = {res['compliance_score']}, Risk = {res['risk_level']}, Critical Override = {res['critical_override']}")

        # 6. Pre-configure other demo bidders with realistic scores
        apex_bidder, _ = created_bidders["Apex Dynamics Private Limited"]
        apex_bidder.compliance_score = 92.5
        apex_bidder.risk_level = RiskLevel.LOW.value
        apex_bidder.verification_status = VerificationStatus.VERIFIED.value
        apex_bidder.officer_decision_status = OfficerDecisionStatus.APPROVED.value

        kaveri_bidder, _ = created_bidders["Kaveri Heavy Industries Limited"]
        kaveri_bidder.compliance_score = 88.0
        kaveri_bidder.risk_level = RiskLevel.LOW.value
        kaveri_bidder.verification_status = VerificationStatus.VERIFIED.value
        kaveri_bidder.officer_decision_status = OfficerDecisionStatus.UNDER_REVIEW.value

        bharat_bidder, _ = created_bidders["Bharat Tech Solutions Private Limited"]
        bharat_bidder.compliance_score = 78.5
        bharat_bidder.risk_level = RiskLevel.MEDIUM.value
        bharat_bidder.verification_status = VerificationStatus.VERIFIED.value
        bharat_bidder.officer_decision_status = OfficerDecisionStatus.CLARIFICATION_REQUESTED.value

        zenith_bidder, _ = created_bidders["Zenith Global Corp"]
        zenith_bidder.compliance_score = 45.0
        zenith_bidder.risk_level = RiskLevel.HIGH.value
        zenith_bidder.verification_status = VerificationStatus.VERIFIED.value
        zenith_bidder.officer_decision_status = OfficerDecisionStatus.REJECTED.value

        db.commit()
        print("Seeding completed successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
