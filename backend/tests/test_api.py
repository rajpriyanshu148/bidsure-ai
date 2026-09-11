import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "BidSure" in data["app_name"]


def test_auth_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "officer@bidsure.gov.in", "password": "Password@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "PROCUREMENT_OFFICER"


def test_auth_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "officer@bidsure.gov.in", "password": "WrongPassword!"},
    )
    assert response.status_code == 401


def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_tenders"] >= 3
    assert data["total_bidders"] >= 5
    assert "compliance_distribution" in data


def test_list_tenders():
    response = client.get("/api/v1/tenders")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    tender_nums = [t["tender_number"] for t in data]
    assert "GEM/2026/B/DEMO001" in tender_nums


def test_mock_government_simulation():
    response = client.post(
        "/api/v1/verification/simulate",
        json={"source": "MOCK_GSTN", "query_param": "03AAACA1234F1Z5"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "ACTIVE"
    assert data["data"]["is_simulated"] is True


def test_demo_bidder_compliance_verification():
    # Fetch tenders to get demo tender id
    tenders_res = client.get("/api/v1/tenders")
    assert tenders_res.status_code == 200
    demo_tender = next(t for t in tenders_res.json() if t["tender_number"] == "GEM/2026/B/DEMO001")

    # Get bidders for demo tender
    bidders_res = client.get(f"/api/v1/tenders/{demo_tender['id']}/bidders")
    assert bidders_res.status_code == 200
    bidders = bidders_res.json()
    abc_bidder = next(b for b in bidders if "ABC Engineering" in b["company_name"])

    # Check compliance summary
    comp_res = client.get(f"/api/v1/bidders/{abc_bidder['id']}/compliance")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()

    assert comp_data["risk_level"] == "HIGH"
    results = comp_data["compliance_results"]
    results_map = {r["rule_name"]: r for r in results}

    assert "TURNOVER" in results_map
    assert results_map["TURNOVER"]["status"] == "FAIL"
    assert "7.8" in results_map["TURNOVER"]["actual_value"]

    assert "OEM_AUTHORIZATION" in results_map
    assert results_map["OEM_AUTHORIZATION"]["status"] == "MISSING"

    assert "LOCAL_CONTENT" in results_map
    assert results_map["LOCAL_CONTENT"]["status"] == "FAIL"

    assert "GST" in results_map
    assert results_map["GST"]["status"] == "PASS"

    assert "PAN" in results_map
    assert results_map["PAN"]["status"] == "PASS"
