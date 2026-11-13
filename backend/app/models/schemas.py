from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    PUBLIC = "public"
    TIER1_AGENT = "tier1_agent"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"

class SecurityDecision(str, Enum):
    ALLOWED = "ALLOWED"
    BLOCKED = "BLOCKED"
    REQUIRES_CONFIRMATION = "REQUIRES_CONFIRMATION"

class ThreatSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class ThreatCategory(str, Enum):
    DIRECT_PROMPT_INJECTION = "Direct Prompt Injection"
    INDIRECT_PROMPT_INJECTION = "Indirect Prompt Injection"
    MALICIOUS_RETRIEVED_DOC = "Malicious Retrieved Document"
    UNAUTHORISED_TOOL_CALL = "Unauthorised Tool Call"
    SENSITIVE_DATA_EXPOSURE = "Sensitive Data Exposure"
    ROLE_BYPASS_ATTEMPT = "Role and Permission Bypass"
    CROSS_USER_ACCESS = "Cross-User Data Access (IDOR)"
    MALFORMED_TOOL_ARGUMENT = "Malformed Tool Argument"
    BENIGN = "Benign Request"

# Chat schemas
class ChatMessage(BaseModel):
    role: str
    content: str
    tool_calls: Optional[list[dict[str, Any]]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    user_id: Optional[str] = "cust_001"
    user_role: Optional[UserRole] = UserRole.TIER1_AGENT
    protected_mode: bool = True
    confirmation_token: Optional[str] = None

class ToolExecutionTrace(BaseModel):
    tool_name: str
    arguments: dict[str, Any]
    decision: SecurityDecision
    policy_rule: str
    reason: str
    execution_time_ms: float
    output: Optional[Any] = None
    sanitized_output: Optional[Any] = None

class ChatResponse(BaseModel):
    response: str
    protected_mode: bool
    status: str # "success", "blocked", "confirmation_required"
    injection_detected: bool
    threat_category: Optional[str] = None
    threat_severity: Optional[str] = None
    violation_reason: Optional[str] = None
    tool_traces: list[ToolExecutionTrace] = []
    confirmation_token: Optional[str] = None
    suggested_action: Optional[str] = None

# Policy schemas
class PolicyRule(BaseModel):
    id: Optional[int] = None
    tool_name: str
    description: str
    sensitivity_level: str # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    min_required_role: UserRole
    requires_confirmation: bool = False
    is_enabled: bool = True
    argument_constraints: dict[str, Any] = Field(default_factory=dict)
    pii_filtering_enabled: bool = True

class PolicyUpdate(BaseModel):
    sensitivity_level: Optional[str] = None
    min_required_role: Optional[UserRole] = None
    requires_confirmation: Optional[bool] = None
    is_enabled: Optional[bool] = None
    argument_constraints: Optional[dict[str, Any]] = None
    pii_filtering_enabled: Optional[bool] = None

# Audit & Threat Schemas
class AuditLogItem(BaseModel):
    id: int
    timestamp: str
    request_id: str
    session_id: str
    user_id: str
    user_role: str
    requested_tool: str
    action_type: str
    decision: str
    policy_rule: str
    explanation: str
    execution_time_ms: float
    protected_mode: bool

class ThreatItem(BaseModel):
    id: int
    timestamp: str
    threat_category: str
    severity: str
    requested_action: str
    decision: str
    reason: str
    user_id: str
    user_role: str
    payload_snippet: str

# Simulation Schemas
class SimulationScenario(BaseModel):
    id: str
    title: str
    category: ThreatCategory
    severity: ThreatSeverity
    description: str
    attack_payload: str
    target_tool: str
    intended_exploit: str
    expected_outcome_protected: str
    expected_outcome_unprotected: str

class SimulationRunRequest(BaseModel):
    scenario_id: str
    protected_mode: bool = True

class SimulationResult(BaseModel):
    scenario_id: str
    title: str
    category: str
    severity: str
    protected_mode: bool
    status: str # "PASSED" (defense worked), "FAILED" (vulnerable/exploit succeeded in unprotected)
    decision: str # "BLOCKED", "ALLOWED", "SIMULATED_EXPLOIT"
    execution_time_ms: float
    explanation: str
    agent_output: str
    tool_invoked: Optional[str] = None
    payload_used: str

# Dashboard & Benchmark Schemas
class DashboardStats(BaseModel):
    total_tests_executed: int
    detected_malicious_inputs: int
    blocked_unauthorised_actions: int
    allowed_safe_requests: int
    recent_alerts_count: int
    attack_category_distribution: list[dict[str, Any]]
    security_activity_timeline: list[dict[str, Any]]
    recent_audit_events: list[AuditLogItem]
    recent_threats: list[ThreatItem]

class BenchmarkMetrics(BaseModel):
    total_tests: int
    malicious_tests: int
    benign_tests: int
    blocked_malicious: int # True Positives
    failed_unauthorised: int # False Negatives (exploits allowed)
    correctly_allowed_benign: int # True Negatives
    incorrectly_blocked_benign: int # False Positives
    blocking_rate_pct: float # (blocked_malicious / malicious_tests) * 100
    false_positive_rate_pct: float # (incorrectly_blocked_benign / benign_tests) * 100
    precision_pct: float
    recall_pct: float
    f1_score_pct: float
    avg_decision_time_ms: float
    protected_vs_unprotected_comparison: list[dict[str, Any]]
