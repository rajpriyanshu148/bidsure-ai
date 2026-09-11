export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'PROCUREMENT_OFFICER' | 'AUDITOR';
  is_active: boolean;
  created_at: string;
}

export interface TenderRequirement {
  id: string;
  tender_id: string;
  rule_type: string;
  description: string;
  min_value?: number | null;
  max_value?: number | null;
  expected_text?: string | null;
  currency: string;
  weight: number;
  mandatory: boolean;
  is_critical: boolean;
  created_at: string;
}

export interface Tender {
  id: string;
  tender_number: string;
  title: string;
  description?: string;
  category: string;
  estimated_value: number;
  closing_date?: string;
  status: 'DRAFT' | 'ACTIVE' | 'EVALUATION' | 'CLOSED';
  created_at: string;
  updated_at: string;
  bidders_count?: number;
  average_score?: number;
  requirements?: TenderRequirement[];
}

export interface Bidder {
  id: string;
  tender_id: string;
  company_name: string;
  cin?: string;
  pan?: string;
  gstin?: string;
  udyam_number?: string;
  contact_email?: string;
  contact_phone?: string;
  submitted_at: string;
  compliance_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  verification_status: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'FAILED';
  officer_decision_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'UNDER_REVIEW';
  documents_count?: number;
  passed_requirements?: number;
  failed_requirements?: number;
  warning_requirements?: number;
  missing_requirements?: number;
}

export interface ExtractedEntity {
  id: string;
  document_id?: string;
  bidder_id: string;
  entity_type: string;
  raw_value: string;
  normalized_value?: string;
  confidence: number;
  page_number: number;
  is_manually_edited: boolean;
  original_ai_value?: string;
  edited_by?: string;
  edit_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  bidder_id?: string;
  tender_id?: string;
  document_type: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  total_pages: number;
  ocr_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  raw_text?: string;
  created_at: string;
  extracted_entities?: ExtractedEntity[];
}

export interface ComplianceResult {
  id: string;
  bidder_id: string;
  requirement_id?: string;
  rule_name: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'MISSING' | 'EXPIRED' | 'INCONSISTENT' | 'REVIEW_REQUIRED' | 'NOT_APPLICABLE';
  score: number;
  confidence: number;
  reason: string;
  expected_value?: string;
  actual_value?: string;
  difference?: string;
  evidence_document_id?: string;
  evidence_document_name?: string;
  evidence_page_number?: string;
  evidence_snippet?: string;
  rule_metadata?: Record<string, any>;
  created_at: string;
}

export interface RiskScore {
  id: string;
  bidder_id: string;
  numerical_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  critical_override_applied: boolean;
  override_reason?: string;
  breakdown?: Record<string, any>;
  calculated_at: string;
}

export interface AIRecommendation {
  id: string;
  bidder_id: string;
  overall_assessment: string;
  key_issues: string[];
  positive_checks: string[];
  recommendation_text: string;
  advisory_disclaimer: string;
  generated_at: string;
}

export interface OfficerDecision {
  id: string;
  bidder_id: string;
  officer_name: string;
  decision: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'UNDER_REVIEW';
  justification_remarks: string;
  disclaimer_acknowledged: boolean;
  decided_at: string;
}

export interface GovernmentVerification {
  id: string;
  bidder_id: string;
  source: string;
  query_param: string;
  status: string;
  raw_response: Record<string, any>;
  is_simulated: boolean;
  verified_at: string;
}

export interface AuditLog {
  id: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_tenders: number;
  active_tenders: number;
  total_bidders: number;
  bidders_under_review: number;
  average_compliance_score: number;
  high_risk_bidders: number;
  compliance_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  status_distribution: {
    PASS: number;
    WARNING: number;
    FAIL: number;
    MISSING: number;
  };
  recent_tenders: Tender[];
  high_risk_bidder_list: Bidder[];
}
