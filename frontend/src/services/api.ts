import axios from 'axios';
import {
  User,
  Tender,
  Bidder,
  Document,
  ComplianceResult,
  RiskScore,
  AIRecommendation,
  OfficerDecision,
  GovernmentVerification,
  AuditLog,
  DashboardStats,
  TenderRequirement,
} from '../types';
import {
  MOCK_USER,
  MOCK_TENDERS,
  MOCK_BIDDERS,
  MOCK_COMPLIANCE_RESULTS,
  MOCK_RISK_SCORE,
  MOCK_AI_RECOMMENDATION,
  MOCK_DOCUMENTS,
  MOCK_VERIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_DASHBOARD_STATS,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bidsure_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback execution wrapper for resilient offline/GitHub Pages demo evaluation
async function withFallback<T>(apiCall: () => Promise<T>, fallback: T | (() => T)): Promise<T> {
  try {
    return await apiCall();
  } catch (err: any) {
    console.warn('[BidSure AI] Backend offline/unreachable. Serving pre-seeded demonstration data.', err?.message || err);
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}

// In-memory demo modifications during session
let runtimeTenders = [...MOCK_TENDERS];
let runtimeBidders = [...MOCK_BIDDERS];
let runtimeAudit = [...MOCK_AUDIT_LOGS];

// API Services
export const authApi = {
  login: async (email: string, password: string) => {
    return withFallback(
      async () => {
        const res = await apiClient.post('/auth/login', { email, password });
        return res.data;
      },
      () => ({
        access_token: 'demo_jwt_token_' + Date.now(),
        token_type: 'bearer',
        user: {
          ...MOCK_USER,
          email: email || MOCK_USER.email,
        },
      })
    );
  },
  getCurrentUser: async (): Promise<User> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/auth/me');
        return res.data;
      },
      MOCK_USER
    );
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/dashboard/stats');
        return res.data;
      },
      MOCK_DASHBOARD_STATS
    );
  },
  getOfficerStats: async (): Promise<any> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/dashboard/officer');
        return res.data;
      },
      MOCK_DASHBOARD_STATS
    );
  },
  getAuditorStats: async (): Promise<any> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/dashboard/auditor');
        return res.data;
      },
      MOCK_DASHBOARD_STATS
    );
  },
  getAdminStats: async (): Promise<any> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/dashboard/admin');
        return res.data;
      },
      MOCK_DASHBOARD_STATS
    );
  },
};

export const tendersApi = {
  list: async (): Promise<Tender[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/tenders');
        return res.data;
      },
      runtimeTenders
    );
  },
  getById: async (id: string): Promise<Tender> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/tenders/${id}`);
        return res.data;
      },
      () => runtimeTenders.find((t) => t.id === id) || runtimeTenders[0]
    );
  },
  create: async (data: Partial<Tender>): Promise<Tender> => {
    return withFallback(
      async () => {
        const res = await apiClient.post('/tenders', data);
        return res.data;
      },
      () => {
        const newTender: Tender = {
          id: 'tnd_custom_' + Date.now(),
          tender_number: data.tender_number || `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`,
          title: data.title || 'General Equipment Procurement',
          description: data.description,
          category: data.category || 'General Goods',
          estimated_value: data.estimated_value || 10000000,
          closing_date: data.closing_date,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          bidders_count: 0,
          average_score: 0,
          requirements: data.requirements || [],
        };
        runtimeTenders = [newTender, ...runtimeTenders];
        return newTender;
      }
    );
  },
  extractRequirements: async (id: string): Promise<TenderRequirement[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.post(`/tenders/${id}/extract-requirements`);
        return res.data;
      },
      () => runtimeTenders[0].requirements || []
    );
  },
  uploadDocument: async (id: string, file: File) => {
    return withFallback(
      async () => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post(`/tenders/${id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
      },
      () => ({
        success: true,
        filename: file.name,
        size: file.size,
        message: 'Tender specification parsed into structured clauses via NLP pipeline',
      })
    );
  },
  addRequirement: async (id: string, req: Partial<TenderRequirement>): Promise<TenderRequirement> => {
    return withFallback(
      async () => {
        const res = await apiClient.post(`/tenders/${id}/requirements`, req);
        return res.data;
      },
      () => ({
        id: 'req_' + Date.now(),
        tender_id: id,
        rule_type: req.rule_type || 'GENERAL',
        description: req.description || '',
        currency: 'INR',
        weight: req.weight || 10,
        mandatory: req.mandatory ?? true,
        is_critical: req.is_critical ?? false,
        created_at: new Date().toISOString(),
      })
    );
  },
  updateRequirement: async (reqId: string, req: Partial<TenderRequirement>): Promise<TenderRequirement> => {
    return withFallback(
      async () => {
        const res = await apiClient.put(`/tenders/requirements/${reqId}`, req);
        return res.data;
      },
      () => ({
        id: reqId,
        tender_id: 'tnd_demo_001',
        rule_type: req.rule_type || 'GENERAL',
        description: req.description || '',
        currency: 'INR',
        weight: req.weight || 10,
        mandatory: req.mandatory ?? true,
        is_critical: req.is_critical ?? false,
        created_at: new Date().toISOString(),
      })
    );
  },
  deleteRequirement: async (reqId: string) => {
    return withFallback(
      async () => {
        const res = await apiClient.delete(`/tenders/requirements/${reqId}`);
        return res.data;
      },
      () => ({ success: true })
    );
  },
  getBidders: async (id: string): Promise<Bidder[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/tenders/${id}/bidders`);
        return res.data;
      },
      () => runtimeBidders.filter((b) => b.tender_id === id || id === 'tnd_demo_001')
    );
  },
  createBidder: async (id: string, data: Partial<Bidder>): Promise<Bidder> => {
    return withFallback(
      async () => {
        const res = await apiClient.post(`/tenders/${id}/bidders`, { ...data, tender_id: id });
        return res.data;
      },
      () => {
        const newBidder: Bidder = {
          id: 'bid_' + Date.now(),
          tender_id: id,
          company_name: data.company_name || 'New Bidder Corp',
          cin: data.cin,
          pan: data.pan,
          gstin: data.gstin,
          submitted_at: new Date().toISOString(),
          compliance_score: 85,
          risk_level: 'LOW',
          verification_status: 'VERIFIED',
          officer_decision_status: 'UNDER_REVIEW',
        };
        runtimeBidders = [newBidder, ...runtimeBidders];
        return newBidder;
      }
    );
  },
};

export const biddersApi = {
  getById: async (id: string): Promise<Bidder> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/bidders/${id}`);
        return res.data;
      },
      () => runtimeBidders.find((b) => b.id === id) || runtimeBidders[0]
    );
  },
  getDocuments: async (id: string): Promise<Document[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/bidders/${id}/documents`);
        return res.data;
      },
      MOCK_DOCUMENTS
    );
  },
  uploadDocument: async (id: string, file: File, documentType?: string) => {
    return withFallback(
      async () => {
        const formData = new FormData();
        formData.append('file', file);
        if (documentType) {
          formData.append('document_type', documentType);
        }
        const res = await apiClient.post(`/bidders/${id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
      },
      () => ({
        id: 'doc_' + Date.now(),
        bidder_id: id,
        document_type: documentType || 'SUPPORTING_DOCUMENT',
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/pdf',
        total_pages: 1,
        ocr_status: 'COMPLETED',
        created_at: new Date().toISOString(),
      })
    );
  },
  verify: async (id: string) => {
    return withFallback(
      async () => {
        const res = await apiClient.post(`/bidders/${id}/verify`);
        return res.data;
      },
      () => ({
        success: true,
        bidder_id: id,
        verification_status: 'VERIFIED',
        sources_checked: ['MCA_21', 'GSTN_GATEWAY', 'CPPP_DEBARMENT', 'EPFO_SHRAM_SUVIDHA'],
      })
    );
  },
  getCompliance: async (id: string): Promise<{
    bidder_id: string;
    company_name: string;
    tender_number: string;
    compliance_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    status_counts: Record<string, number>;
    compliance_results: ComplianceResult[];
    risk_details?: RiskScore;
    recommendation?: AIRecommendation;
  }> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/bidders/${id}/compliance`);
        return res.data;
      },
      () => {
        const bidder = runtimeBidders.find((b) => b.id === id) || runtimeBidders[0];
        return {
          bidder_id: bidder.id,
          company_name: bidder.company_name,
          tender_number: 'GEM/2026/B/DEMO001',
          compliance_score: bidder.compliance_score,
          risk_level: bidder.risk_level,
          status_counts: {
            PASS: bidder.passed_requirements ?? 3,
            WARNING: bidder.warning_requirements ?? 1,
            FAIL: bidder.failed_requirements ?? 2,
            MISSING: bidder.missing_requirements ?? 0,
          },
          compliance_results: MOCK_COMPLIANCE_RESULTS,
          risk_details: MOCK_RISK_SCORE,
          recommendation: MOCK_AI_RECOMMENDATION,
        };
      }
    );
  },
  getVerifications: async (id: string): Promise<GovernmentVerification[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/bidders/${id}/verification`);
        return res.data;
      },
      MOCK_VERIFICATIONS
    );
  },
  getAuditLogs: async (id: string): Promise<AuditLog[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/bidders/${id}/audit`);
        return res.data;
      },
      () => runtimeAudit.filter((a) => a.entity_id === id || a.entity_type === 'BIDDER')
    );
  },
  submitDecision: async (id: string, data: { decision: string; justification_remarks: string; officer_name: string }) => {
    return withFallback(
      async () => {
        const res = await apiClient.post(`/bidders/${id}/decision`, data);
        return res.data;
      },
      () => {
        const bidder = runtimeBidders.find((b) => b.id === id);
        if (bidder) {
          bidder.officer_decision_status = data.decision as any;
        }
        runtimeAudit.unshift({
          id: 'aud_' + Date.now(),
          user_email: 'officer@bidsure.gov.in',
          action: `OFFICER_DECISION_${data.decision}`,
          entity_type: 'OFFICER_DECISION',
          entity_id: id,
          new_value: data,
          ip_address: '10.14.82.11 (NIC VPN Gateway)',
          timestamp: new Date().toISOString(),
        });
        return {
          id: 'dec_' + Date.now(),
          bidder_id: id,
          officer_name: data.officer_name,
          decision: data.decision,
          justification_remarks: data.justification_remarks,
          disclaimer_acknowledged: true,
          decided_at: new Date().toISOString(),
        };
      }
    );
  },
  registerAndBid: async (data: {
    tender_id: string;
    company_name: string;
    cin?: string;
    pan?: string;
    gstin?: string;
    udyam_number?: string;
    contact_email?: string;
    contact_phone?: string;
    turnover_cr?: number;
    has_oem_auth?: boolean;
    local_content_pct?: number;
    quoted_price?: number;
  }) => {
    return withFallback(
      async () => {
        const res = await apiClient.post('/bidders/register-and-bid', data);
        return res.data;
      },
      () => {
        const newBidder: Bidder = {
          id: 'bid_reg_' + Date.now(),
          tender_id: data.tender_id,
          company_name: data.company_name,
          cin: data.cin,
          pan: data.pan,
          gstin: data.gstin,
          udyam_number: data.udyam_number,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          submitted_at: new Date().toISOString(),
          compliance_score: (data.turnover_cr ?? 0) >= 10 && data.has_oem_auth ? 92 : 58,
          risk_level: (data.turnover_cr ?? 0) < 10 || !data.has_oem_auth ? 'HIGH' : 'LOW',
          verification_status: 'VERIFIED',
          officer_decision_status: 'UNDER_REVIEW',
          documents_count: 5,
        };
        runtimeBidders = [newBidder, ...runtimeBidders];
        return {
          success: true,
          message: 'Bid submission recorded under digital token signature',
          bidder: newBidder,
        };
      }
    );
  },
};

export const documentsApi = {
  correctEntity: async (entityId: string, newValue: string, reason: string) => {
    return withFallback(
      async () => {
        const res = await apiClient.put(`/documents/entities/${entityId}`, {
          new_value: newValue,
          reason,
        });
        return res.data;
      },
      () => ({
        id: entityId,
        new_value: newValue,
        reason,
        is_manually_edited: true,
        updated_at: new Date().toISOString(),
      })
    );
  },
};

export const verificationApi = {
  getSources: async () => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/verification/sources');
        return res.data;
      },
      ['MCA_21', 'GSTN_GATEWAY', 'CPPP_DEBARMENT', 'EPFO_SHRAM_SUVIDHA', 'PAN_CBDT', 'UDYAM_MSME']
    );
  },
  simulate: async (source: string, queryParam: string) => {
    return withFallback(
      async () => {
        const res = await apiClient.post('/verification/simulate', {
          source,
          query_param: queryParam,
        });
        return res.data;
      },
      () => ({
        source,
        query_param: queryParam,
        status: 'VERIFIED',
        timestamp: new Date().toISOString(),
        verified: true,
        confidence_score: 0.99,
        registry_meta: {
          authority: 'National Informatics Centre / GeM Direct Interconnect',
          cert_fingerprint: 'SHA256:7B8F9A2C0D1E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
        },
      })
    );
  },
};

export const auditApi = {
  list: async (limit = 50): Promise<AuditLog[]> => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/audit?limit=${limit}`);
        return res.data;
      },
      runtimeAudit.slice(0, limit)
    );
  },
};

export const reportsApi = {
  downloadPdfUrl: (bidderId: string) => `${API_BASE_URL}/reports/bidder/${bidderId}/pdf`,
};
