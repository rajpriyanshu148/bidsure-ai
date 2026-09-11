import os
import pymupdf as fitz


def create_demo_pdf(file_path: str, pages_content: list[str], title: str = ""):
    doc = fitz.open()
    for idx, content in enumerate(pages_content):
        page = doc.new_page(width=595, height=842)  # A4
        # Header rect
        page.draw_rect(fitz.Rect(36, 36, 559, 75), color=(0.04, 0.15, 0.27), fill=(0.04, 0.15, 0.27))
        page.insert_text(fitz.Point(46, 60), title or "GOVERNMENT OF INDIA - OFFICIAL DOCUMENT", fontsize=12, color=(1, 1, 1))

        # Page number
        page.insert_text(fitz.Point(500, 810), f"Page {idx + 1} of {len(pages_content)}", fontsize=8, color=(0.4, 0.4, 0.4))

        # Body text
        rect = fitz.Rect(46, 95, 549, 790)
        page.insert_textbox(rect, content, fontsize=10, fontname="helv", color=(0.1, 0.1, 0.1))

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc.save(file_path)
    doc.close()
    print(f"Created: {file_path}")


def generate_all_demo_documents(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    # 1. Tender Document (GEM/2026/B/DEMO001)
    tender_pages = [
        """GOVERNMENT E-MARKETPLACE (GeM)
BID DOCUMENT - INDUSTRIAL PUMP PROCUREMENT
Bid Number: GEM/2026/B/DEMO001
Dated: 15-January-2026

1. INVITATION FOR BIDS
GeM invites technical and financial bids for the supply, installation, and commissioning of Heavy-Duty Industrial Centrifugal Pumps for State Irrigation Works.

2. MANDATORY ELIGIBILITY CRITERIA:
2.1 Financial Eligibility:
The bidder must have achieved a Minimum Average Annual Turnover of ₹10.0 Crore (Rupees Ten Crore only) during the last 3 financial years (FY 2021-22, 2022-23, 2023-24). Audited balance sheets and Income Tax Return (ITR) filings must be submitted as proof.

2.2 Statutory Registrations:
- Bidder must possess active Goods and Services Tax (GSTIN) registration.
- Bidder must hold valid Permanent Account Number (PAN) issued by CBDT.
- Bidder must submit valid MSME Udyam Registration Certificate under Manufacturing category.

2.3 Technical & OEM Compliance:
- OEM Authorization (MAF): If bidder is not the original manufacturer, a valid, tender-specific OEM Authorization Form is strictly mandatory.
- Public Procurement (Make in India): Minimum Local Content of 50% is required to qualify as Class-I Local Supplier under DPIIT order.

2.4 Integrity & Debarment:
- The bidder must submit a notarized affidavit stating that they are not currently debarred or blacklisted by any Central/State Government department, PSU, or autonomous body.""",
        """BID SPECIFICATIONS & SPECIAL CONDITIONS
Bid Number: GEM/2026/B/DEMO001
Page 2 - General Clauses

3. DOCUMENTS REQUIRED IN BID SUBMISSION:
- Copy of PAN Card
- GST Registration Certificate (Form GST REG-06)
- MSME Udyam Certificate
- Income Tax Returns (ITR-V) for last 3 Assessment Years
- Audited Profit & Loss Statement and Balance Sheet
- Manufacturer's Authorization Form (MAF)
- Make in India Local Content Self-Declaration Affidavit
- Non-Blacklisting Notarized Affidavit

4. EVALUATION PROCEDURE:
Bids will be scrutinized automatically and verified against central statutory databases. Any false declaration or failure to meet mandatory turnover, local content, or statutory validity will lead to disqualification under General Financial Rules (GFR).

Designated Authority:
Superintending Procurement Officer, Central Water Commission""",
    ]
    create_demo_pdf(os.path.join(output_dir, "Tender_Industrial_Pumps.pdf"), tender_pages, "GeM TENDER: GEM/2026/B/DEMO001")

    # 2. ABC Engineering PAN Card
    pan_pages = [
        """INCOME TAX DEPARTMENT
GOVERNMENT OF INDIA
PERMANENT ACCOUNT NUMBER CARD

Permanent Account Number: AAACA1234F
Name: ABC ENGINEERING PRIVATE LIMITED
Father's/Entity Status: Company
Date of Incorporation: 14/10/2019

Category: Indian Private Limited Enterprise
CBDT Certified Card Identification: PAN/DL/2019/88921"""
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_PAN.pdf"), pan_pages, "INCOME TAX DEPARTMENT - PAN CARD")

    # 3. ABC Engineering GST Certificate
    gst_pages = [
        """Government of India
Form GST REG-06
[See Rule 10(1)]
Registration Certificate

Registration Number (GSTIN): 03AAACA1234F1Z5
Legal Name: ABC Engineering Private Limited
Trade Name: ABC Engineering Works
Constitution of Business: Private Limited Company
Address of Principal Place of Business:
Plot No. 45-B, Phase 5, Focal Point Industrial Area, Ludhiana, Punjab, 141010

Date of Liability: 15/04/2020
Period of Validity: From 15/04/2020 To Permanent
Type of Registration: Regular
Jurisdiction: Ward 4, Circle 2, Ludhiana Central""",
        """Form GST REG-06 (Annexure A)
Details of Additional Places of Business & Directors

Managing Director: Sunil Verma (DIN: 07654321)
Director: Rajesh Sharma (DIN: 01234567)

Return Filing Status:
GSTR-1 Filed up to current quarter.
GSTR-3B Filed and tax liabilities discharged.
Status on Portal: ACTIVE""",
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_GST.pdf"), gst_pages, "GST REGISTRATION CERTIFICATE")

    # 4. ABC Engineering Udyam Certificate
    udyam_pages = [
        """MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES
UDYAM REGISTRATION CERTIFICATE

UDYAM REGISTRATION NUMBER: UDYAM-PB-12-0012345
NAME OF ENTERPRISE: ABC ENGINEERING PRIVATE LIMITED

TYPE OF ENTERPRISE: MEDIUM ENTERPRISE
MAJOR ACTIVITY: MANUFACTURING
DATE OF COMMENCEMENT OF PRODUCTION: 20/11/2019

NATIONAL INDUSTRY CLASSIFICATION CODE (NIC):
28131 - Manufacture of pumps and compressors

Location of Plant:
Industrial Area Phase 5, Ludhiana, Punjab - 141010
Certified under Ministry of MSME, Govt of India."""
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_Udyam.pdf"), udyam_pages, "UDYAM REGISTRATION CERTIFICATE")

    # 5. ABC Engineering ITR Return (8 Pages, Page 8 has Turnover of ₹7.8 Crore)
    itr_pages = []
    for i in range(1, 8):
        itr_pages.append(f"""INDIAN INCOME TAX RETURN ACKNOWLEDGEMENT
Assessment Year: 2024-25 (Financial Year: 2023-24)
Form: ITR-6 (Companies other than claiming exemption under section 11)

PAN: AAACA1234F
Name: ABC ENGINEERING PRIVATE LIMITED
Filing Date: 28-October-2024
Acknowledgment Number: 987654321012345

Schedule Part A - General Company Details
CIN: U28131PB2019PTC050123
Residential Status: Resident Indian Enterprise
Page {i} of 8 - Statutory Disclosures and Tax Computations.""")

    # Page 8: Financial Turnover Figures
    itr_pages.append("""INDIAN INCOME TAX RETURN FORM ITR-6
Assessment Year: 2024-25 | PAN: AAACA1234F
SCHEDULE PART B-TI: COMPUTATION OF TOTAL INCOME & TURNOVER

PART 1: GROSS TURNOVER AND REVENUE FROM OPERATIONS:
1. Gross Revenue from Sale of Goods / Manufacturing: ₹7,54,20,000
2. Professional & Allied Services Revenue: ₹25,80,000
Total Annual Turnover is ₹7.80 Crore (Rupees Seven Crore Eighty Lakhs only)

Turnover for Past 3 Assessment Years:
- AY 2024-25: ₹7.80 Crore
- AY 2023-24: ₹7.20 Crore
- AY 2022-23: ₹6.50 Crore
Average Annual Turnover: ₹7.17 Crore

Tax Computation:
Tax Payable: ₹32,45,000
Advance Tax Paid: ₹33,00,000
Verification: Digitally verified with DSC by Managing Director Sunil Verma.""")
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_ITR_AY2025.pdf"), itr_pages, "INCOME TAX RETURN (ITR-6) AY 2024-25")

    # 6. Balance Sheet
    bs_pages = [
        """INDEPENDENT AUDITOR'S REPORT & BALANCE SHEET
To the Members of ABC Engineering Private Limited

We have audited the accompanying financial statements of ABC Engineering Private Limited as at 31st March 2024.

BALANCE SHEET EXTRACT AS AT 31-MAR-2024:
I. EQUITY AND LIABILITIES:
1. Shareholders' Funds:
   (a) Share Capital: ₹3,50,00,000
   (b) Reserves and Surplus: ₹4,12,00,000
2. Non-Current Liabilities: ₹2,10,00,000
3. Current Liabilities: ₹3,80,00,000
Total Equity and Liabilities: ₹13,52,00,000

Annual Revenue / Sales Turnover : ₹ 7.8 Crore
Net Profit after Tax: ₹84,50,000
Audited by: M/s Khanna & Associates, Chartered Accountants (FRN: 014522N)""",
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_BalanceSheet.pdf"), bs_pages, "AUDITED BALANCE SHEET FY 2023-24")

    # 7. Make in India Declaration (3 Pages, Page 3 states 48% local content)
    mii_pages = [
        """LOCAL CONTENT DECLARATION AFFIDAVIT
Public Procurement (Preference to Make in India) Order 2017
Tender Reference: GEM/2026/B/DEMO001

Page 1 of 3: Background & Supplier Undertaking
I, Sunil Verma, Managing Director of ABC Engineering Private Limited, solemnly affirm and declare that our manufacturing facility located at Ludhiana, Punjab manufactures components for industrial water pumps.""",
        """Page 2 of 3: Bill of Materials & Cost Breakdown
Breakdown of domestic versus imported sub-assemblies:
- Casting and Impeller: Indigenous (Ludhiana)
- Mechanical Seal & Bearings: Imported (Germany/Japan)
- Motor and Wiring: Indigenous (Coimbatore)
- Control Panel & Sensors: Imported""",
        """Page 3 of 3: Final Local Content Percentage Certification
In accordance with DPIIT Public Procurement Order:

Local Content is 48% (Forty-Eight Percent only).
Supplier Classification: Class-II Local Supplier (Local content between 20% and 50%).

Place of Manufacturing: Focal Point Phase 5, Ludhiana.
Verified by Statutory Cost Auditor.""",
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_MakeInIndia.pdf"), mii_pages, "MAKE IN INDIA LOCAL CONTENT DECLARATION")

    # 8. Blacklisting Affidavit
    bl_pages = [
        """BEFORE THE EXECUTIVE MAGISTRATE / NOTARY PUBLIC, LUDHIANA
AFFIDAVIT OF NON-BLACKLISTING AND NON-DEBARMENT

I, Sunil Verma, aged 48 years, Managing Director of M/s ABC Engineering Private Limited, having registered office at Plot 45-B, Phase 5, Focal Point, Ludhiana, Punjab, do hereby solemnly affirm and state as under:

1. That the deponent is well conversant with the affairs of the company and duly authorized to swear this affidavit.
2. That M/s ABC Engineering Private Limited or any of its directors have NEVER been blacklisted or debarred by Government of India, any State Government, GeM, or Public Sector Undertaking.
3. That there are no ongoing vigilance proceedings, CBI inquiries, or integrity pact violations against the firm.
4. That if any statement made herein is found false, the GeM procurement authority shall be free to cancel the bid, forfeit the EMD, and initiate legal proceedings under Indian Penal Code.

Deponent:
Sunil Verma, Managing Director
Attested by Notary Public with Stamp."""
    ]
    create_demo_pdf(os.path.join(output_dir, "ABC_Eng_Blacklisting_Affidavit.pdf"), bl_pages, "AFFIDAVIT OF NON-BLACKLISTING")

    print("All demo synthetic documents successfully generated!")


if __name__ == "__main__":
    base_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))
    generate_all_demo_documents(base_data_dir)
