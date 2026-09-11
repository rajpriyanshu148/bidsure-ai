# BidSure AI

> **AI-Powered Bid Compliance Verification & Decision Support Platform**  
> Built for the Smart India Hackathon (SIH) — Problem Statement **SIH26100**: *AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement*

---

## 1. Project Overview

**BidSure AI** is an enterprise-grade decision-support platform engineered for Government e-Marketplace (GeM) Procurement Officers. It automates the laborious, document-heavy process of verifying bidder statutory eligibility, financial thresholds, and technical criteria against tender specifications. 

The platform implements an **evidence-first, hybrid AI + deterministic rule architecture**:
- **AI & Document Intelligence** extracts text via multi-backend OCR, parses complex entities, calculates semantic similarity for legal corporate names, and grounds explanations with exact document/page citations.
- **Deterministic Code Rules** calculate financial thresholds (e.g. ₹7.8 Cr < ₹10 Cr -> `FAIL`), validate GSTIN/PAN regex formats, evaluate certificate validity dates, and compute weighted compliance scores.
- **Decision Support Principle**: The AI never independently makes final legal qualification decisions. The competent **Procurement Officer** retains exclusive authority, backed by transparent evidence and an immutable audit trail.

---

## 2. SIH Problem Statement (SIH26100)

In public procurement on GeM, evaluating bids requires manual scrutiny across tens of certificates, financial balance sheets, statutory portals, and legal affidavits. Manual scrutiny is prone to oversights, forged certificates, inconsistent entity variations, and hours of administrative delay. 

**BidSure AI solves SIH26100** by unifying document parsing, simulated government database cross-checks, modular deterministic compliance rules, and AI advisory recommendations into a seamless 2-minute decision workflow.

---

## 3. Core Architecture & Hybrid Design Principle

```
+-----------------------------------------------------------------------------------+
|                        React 18 + Vite + Tailwind CSS Frontend                    |
|       (GeM Government Enterprise UI: Dashboard, Matrix, Evidence Viewer, Decisions)|
+-----------------------------------------+-----------------------------------------+
                                          | REST API (Axios + JWT)
                                          v
+-----------------------------------------------------------------------------------+
|                            FastAPI Gateway (Python 3.11+)                         |
|     (Authentication, RBAC, Background Processing, Audit Service, PDF Generation)  |
+-------------------+---------------------+--------------------+--------------------+
                    |                     |                    |
                    v                     v                    v
+-----------------------+ +-------------------------+ +-------------------------+
|   Document AI Pipeline| | Deterministic Rule Eng. | | Mock Govt Adapters      |
| - PyMuPDF Text Layer  | | - Turnover Rule         | | - GSTN Portal           |
| - OCR Fallback        | | - GST & PAN Rules       | | - CBDT PAN              |
| - Entity Extractor    | | - MSME Udyam Rule       | | - MSME Udyam            |
| - Name Normalizer     | | - OEM Authorization     | | - Income Tax E-filing   |
| - Semantic Matching   | | - Make in India % Rule  | | - MCA21 / CIN           |
| - Evidence RAG Store  | | - Debarment Override    | | - CVC Blacklisting      |
| - Grounded Explainer  | | - Weighted 0-100 Score  | | - EPFO & ESIC           |
+-----------------------+ +-------------------------+ +-------------------------+
                    |                     |                    |
                    +---------------------+--------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             Database & Audit Persistence                          |
|         (SQLite for Zero-Config Local Run / PostgreSQL for Production / S3)       |
+-----------------------------------------------------------------------------------+
```

### The Hybrid AI-Deterministic Philosophy:
```text
FACT:              Extracted ITR reports annual turnover = ₹7.8 Crore
TENDER RULE:       Required Minimum Turnover >= ₹10 Crore
DETERMINISTIC CODE: 7.8 < 10.0 -> Result: FAIL (Deficit: ₹2.20 Crore)
EVIDENCE:          ITR_AY2025.pdf, Page 8, Line item: Schedule Part B-TI
AI EXPLANATION:    The bidder does not meet the mandatory financial turnover condition.
OFFICER DECISION:  Procurement Officer reviews evidence and officially records decision.
```

---

## 4. Key Features

1. **One-Click AI Verification**: Scrutinizes bidder documents, cross-checks statutory databases, and computes compliance in seconds.
2. **Deterministic Compliance Rule Engine**: 12 modular rules evaluating Turnover, GSTIN, PAN, Udyam, OEM Authorization, Make in India, Certificate Expiry, and Entity Name Consistency.
3. **Evidence-First Inspection**: Every single matrix row links to the exact source document, page number, and extracted citation snippet.
4. **Critical Rule Overrides**: Debarred/blacklisted entities or mandatory financial failures immediately trigger a `HIGH RISK` rating regardless of aggregate score.
5. **Cross-Document Entity Matching**: Normalizes legal corporate suffixes (`Pvt Ltd` -> `Private Limited`) and performs token similarity to prevent identity discrepancies.
6. **Missing & Expired Document Detection**: Detects omitted mandatory forms (e.g. MAF) or certificates expired prior to bid date.
7. **Officer Manual Correction**: Officers can manually correct OCR extractions with mandatory justification logged to the audit log.
8. **12 Mock Government Adapters**: Realistic simulated adapters for GSTN, PAN, Udyam, Income Tax, MCA, Startup India, NSIC, EPFO, ESIC, DigiLocker, and CVC Blacklisting.
9. **Official PDF Compliance Dossier**: Generates downloadable PDF reports with executive summary, compliance matrix, AI advisory, and officer sign-off.
10. **Immutable Audit Trail**: Append-only ledger recording all creations, verifications, corrections, and legal decisions.

---

## 5. Technology Stack

- **Frontend**:
  - React 18
  - Vite 5
  - TypeScript
  - Tailwind CSS (Official GeM government palette: Navy `#0B2545`, Steel Blue `#134074`, Slate `#F8FAFC`, Emerald `#059669`, Crimson `#DC2626`)
  - Lucide React Icons
  - React Router v6
  - Recharts (Interactive compliance & risk distribution charts)
  - Axios
- **Backend**:
  - Python 3.11+
  - FastAPI (REST APIs with auto-generated Swagger `/docs`)
  - Pydantic v2 (Validation schemas)
  - SQLAlchemy (ORM)
  - PyMuPDF (High-speed PDF text layer extraction & rendering)
  - ReportLab (PDF dossier generation)
  - Bcrypt & Python-Jose (JWT authentication & secure hashing)
  - Pytest & HTTPX (Test automation)
- **Database**:
  - SQLite (Default out-of-the-box zero-friction database)
  - PostgreSQL (Production ready via `DATABASE_URL`)
- **Containerization**:
  - Docker & Docker-Compose

---

## 6. Demo Scenario & 2-Minute Judge Walkthrough

The platform comes pre-seeded with the primary Smart India Hackathon evaluation scenario:

### Tender: `GEM/2026/B/DEMO001`
- **Title**: Industrial Heavy-Duty Centrifugal Pump Procurement
- **Mandatory Criteria**:
  1. Minimum Annual Turnover = ₹10.0 Crore
  2. Active GST Registration
  3. Valid PAN Card
  4. MSME Udyam Certificate (Manufacturing)
  5. OEM Authorization Form (MAF) strictly mandatory
  6. Local Content >= 50% (Class-I Local Supplier)
  7. Non-Blacklisting Notarized Affidavit

### Bidder: `ABC Engineering Private Limited`
- **Extracted Turnover**: ₹7.80 Crore (from `ABC_Eng_ITR_AY2025.pdf`, Page 8) -> **FAIL** (`-₹2.20 Crore deficit`)
- **OEM Authorization**: Document omitted by bidder -> **MISSING**
- **Local Content**: Declared 48% (from `ABC_Eng_MakeInIndia.pdf`, Page 3) -> **FAIL** (`-2.0% deficit`)
- **GST Registration**: Active on simulated GSTN -> **PASS**
- **PAN Card**: Valid CBDT status -> **PASS**
- **Udyam Certificate**: Valid Medium Enterprise -> **PASS**
- **Blacklisting**: Clean vigilance record -> **PASS**

### Outcome:
- **Compliance Score**: ~50.0 - 63.0 / 100
- **Risk Level**: **HIGH RISK** (Critical financial deficit override)
- **AI Recommendation**: Advises Procurement Officer to review and disqualify or issue clarification notice.

### 2-Minute Walkthrough Steps:
1. Open the app at `http://localhost:5173` and click **"1-Click Login: Officer"**.
2. On the dashboard, click **"Judge Demo: Load Tenders"** or open `GEM/2026/B/DEMO001`.
3. Click on bidder **"ABC Engineering Private Limited"**.
4. Click **"Run AI Verification"** and watch the 7-stage progress stepper.
5. In the **Compliance Matrix**, observe the deterministic `FAIL` on Turnover, `MISSING` on OEM, and `FAIL` on Local Content.
6. Click **"View Evidence"** on the Turnover row to view the grounded citation from Page 8 of the ITR.
7. Switch to the **Documents** tab and test the **"Correct"** button on an extracted field to demonstrate officer control and audit logging.
8. Switch to **AI Recommendation** to view the advisory root-cause analysis.
9. Click **"Submit Officer Decision"**, select **"Disqualify / Reject Bidder"**, enter remarks, and submit.
10. Click **"Download PDF Dossier"** to inspect the printable compliance report!

---

## 7. Installation & Setup

### Prerequisites:
- Python 3.11+
- Node.js 18+ and npm

### Local Run:

#### 1. Backend Setup:
```powershell
# Navigate to project root
cd C:\Users\rajpr\Downloads\bidsure-ai

# Activate Python virtual environment
.\backend\bidsure-ai-env\Scripts\activate

# Install dependencies (already pre-configured)
pip install -r backend/requirements.txt

# Seed realistic demo database
python scripts/seed.py

# Start FastAPI server
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
Backend API will be available at: `http://localhost:8000`  
Swagger Documentation: `http://localhost:8000/docs`

#### 2. Frontend Setup:
```powershell
# Open a second terminal and navigate to frontend
cd C:\Users\rajpr\Downloads\bidsure-ai\frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## 8. Docker Deployment

To run the entire full-stack system with PostgreSQL in Docker:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 9. Deploying Online via GitHub (GitHub Pages & Cloud)

BidSure AI is configured for automated CI/CD deployment online via **GitHub Actions** and **GitHub Pages**:

### 1-Click Frontend Deployment (GitHub Pages)
1. **Push the repository to GitHub**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/bidsure-ai.git
   git branch -M master
   git push -u origin master
   ```
2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: **Settings** -> **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. **Automatic Build & Live URL**:
   - Every push to `master` automatically triggers `.github/workflows/deploy.yml`.
   - The workflow compiles the React/TypeScript SPA with relative asset bundling (`base: './'`) and publishes to:
     `https://<YOUR_USERNAME>.github.io/bidsure-ai/`
4. **Resilient Offline / Demo Mode**:
   - If an evaluator visits the GitHub Pages link without running a local backend, the frontend automatically activates **Resilient Demonstration Mode**, rendering complete pre-seeded GeM tenders, compliance matrix checks, contradiction analysis, and audit trails!

### Fullstack Cloud Hosting (Render / Railway / Fly.io)
- The FastAPI backend can be deployed to any free cloud container host:
  - **Render**: Connect repository, set build command to `pip install -r backend/requirements.txt` and start command to `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`.
  - Set `VITE_API_BASE_URL` in your GitHub repository secrets or `.env` to point the frontend to your cloud backend URL.

---

## 10. Automated Testing

Run the automated backend test suite (16 comprehensive unit & API integration tests):
```powershell
.\backend\bidsure-ai-env\Scripts\python.exe -m pytest backend/tests -v -o pythonpath=backend
```
All 16 tests cover:
- Health check & token authentication
- Dashboard KPI statistics
- Mock government simulation endpoints
- End-to-end demo bidder verification
- Turnover, GST, PAN, OEM, Local Content, Debarment, and Expiry rules
- Entity name normalization & similarity calculations

---

## 11. Default Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Procurement Officer** | `officer@bidsure.gov.in` | `Password@123` |
| **Administrator** | `admin@bidsure.gov.in` | `Password@123` |
| **CAG Auditor** | `auditor@bidsure.gov.in` | `Password@123` |

---

## 12. Important Note on Mock Government Integrations

> **TRANSPARENT DISCLOSURE**:  
> In compliance with SIH guidelines, BidSure AI incorporates **realistic mock adapters** that simulate the exact API contracts and data formats of government portals (GSTN, CBDT PAN, MSME Udyam, CVC Debarment, MCA21, EPFO, ESIC).  
> The system **does not** falsely claim live unauthorized access to production government servers. The adapter architecture is designed so that authorized production API credentials can be plugged in directly via environment variables without modifying the compliance rule engine.

---

## 13. Security & Compliance
- Role-Based Access Control (RBAC) separating Officer, Admin, and Auditor roles.
- Passwords hashed using standard `bcrypt`.
- JWT access tokens with expiration.
- Input validation and sanitized file uploads.
- Append-only audit logging for compliance traceability.

---

## 14. License
MIT License. Developed for Smart India Hackathon (SIH26100).
