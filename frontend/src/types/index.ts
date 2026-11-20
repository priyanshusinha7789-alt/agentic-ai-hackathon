export type UserRole = 'public' | 'tier1_agent' | 'supervisor' | 'admin';

export type SecurityDecision = 'ALLOWED' | 'BLOCKED' | 'REQUIRES_CONFIRMATION';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ThreatCategory = 
  | 'Direct Prompt Injection'
  | 'Indirect Prompt Injection'
  | 'Malicious Retrieved Document'
  | 'Unauthorised Tool Call'
  | 'Sensitive Data Exposure'
  | 'Role and Permission Bypass'
  | 'Cross-User Data Access (IDOR)'
  | 'Malformed Tool Argument'
  | 'Benign Request';

export interface ToolExecutionTrace {
  tool_name: string;
  arguments: Record<string, any>;
  decision: SecurityDecision;
  policy_rule: string;
  reason: string;
  execution_time_ms: number;
  output?: any;
  sanitized_output?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'success' | 'blocked' | 'confirmation_required' | 'vulnerable';
  tool_traces?: ToolExecutionTrace[];
  confirmation_token?: string;
  threat_category?: string;
  threat_severity?: string;
  violation_reason?: string;
}

export interface ChatResponse {
  response: string;
  protected_mode: boolean;
  status: string;
  injection_detected: boolean;
  threat_category?: string;
  threat_severity?: string;
  violation_reason?: string;
  tool_traces: ToolExecutionTrace[];
  confirmation_token?: string;
  suggested_action?: string;
}

export interface PolicyRule {
  id: number;
  tool_name: string;
  description: string;
  sensitivity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  min_required_role: UserRole;
  requires_confirmation: boolean;
  is_enabled: boolean;
  argument_constraints: Record<string, any>;
  pii_filtering_enabled: boolean;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  request_id: string;
  session_id: string;
  user_id: string;
  user_role: string;
  requested_tool: string;
  action_type: string;
  decision: string;
  policy_rule: string;
  explanation: string;
  execution_time_ms: number;
  protected_mode: boolean;
}

export interface ThreatItem {
  id: number;
  timestamp: string;
  threat_category: string;
  severity: ThreatSeverity;
  requested_action: string;
  decision: string;
  reason: string;
  user_id: string;
  user_role: string;
  payload_snippet: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  description: string;
  attack_payload: string;
  target_tool: string;
  intended_exploit: string;
  expected_outcome_protected: string;
  expected_outcome_unprotected: string;
}

export interface SimulationResult {
  scenario_id: string;
  title: string;
  category: string;
  severity: string;
  protected_mode: boolean;
  status: 'PASSED' | 'FAILED' | 'EXPLOIT_SUCCEEDED';
  decision: string;
  execution_time_ms: number;
  explanation: string;
  agent_output: string;
  tool_invoked?: string;
  payload_used: string;
}

export interface DashboardStats {
  total_tests_executed: number;
  detected_malicious_inputs: number;
  blocked_unauthorised_actions: number;
  allowed_safe_requests: number;
  recent_alerts_count: number;
  attack_category_distribution: Array<{ name: string; value: number }>;
  security_activity_timeline: Array<{ timestamp: string; blocked: number; allowed: number }>;
  recent_audit_events: AuditLogItem[];
  recent_threats: ThreatItem[];
}

export interface BenchmarkMetrics {
  total_tests: number;
  malicious_tests: number;
  benign_tests: number;
  blocked_malicious: number;
  failed_unauthorised: number;
  correctly_allowed_benign: number;
  incorrectly_blocked_benign: number;
  blocking_rate_pct: number;
  false_positive_rate_pct: number;
  precision_pct: number;
  recall_pct: number;
  f1_score_pct: number;
  avg_decision_time_ms: number;
  protected_vs_unprotected_comparison: Array<{
    metric: string;
    "AgentShield Protected": string;
    "Unprotected Baseline": string;
  }>;
}

export interface NovaSupportAnalysis {
  classification: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  confidence: number;
  is_attack: boolean;
  attack_category: string;
  summary: string;
  detected_indicators: string[];
  reasoning_summary: string;
  recommended_action: 'ALLOW' | 'FLAG' | 'BLOCK' | 'REVIEW' | string;
  detection_method: 'GEMINI_AI' | 'RULE_BASED_FALLBACK' | 'NOT_EXECUTED' | string;
}

export interface NovaSupportExecutionResult {
  status: string;
  policy_decision: string;
  response: string;
  target_tool?: string;
  tool_traces?: ToolExecutionTrace[];
  request_id: string;
  execution_time_ms: number;
}

export interface NovaSupportAnalyzeResponse {
  success: boolean;
  analysis: NovaSupportAnalysis;
  execution?: NovaSupportExecutionResult;
  error?: string;
}

