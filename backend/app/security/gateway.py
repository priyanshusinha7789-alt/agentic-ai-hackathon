import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
from app.database import get_db
from app.models.schemas import SecurityDecision, ThreatCategory, ThreatSeverity, ToolExecutionTrace
from app.security.injection_detector import detect_prompt_injection
from app.security.policy_engine import evaluate_tool_policy, PolicyEvaluationResult
from app.security.pii_sanitizer import sanitize_json_payload, scan_for_pii
from app.agent.mock_tools import TOOL_DISPATCHER

class SecurityGatewayException(Exception):
    def __init__(self, message: str, decision: SecurityDecision, policy_rule: str, trace: ToolExecutionTrace):
        super().__init__(message)
        self.decision = decision
        self.policy_rule = policy_rule
        self.trace = trace

def record_audit_log(
    request_id: str,
    session_id: str,
    user_id: str,
    user_role: str,
    requested_tool: str,
    action_type: str,
    decision: str,
    policy_rule: str,
    explanation: str,
    execution_time_ms: float,
    protected_mode: bool
):
    """Inserts an immutable audit record into SQLite database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_logs (
        timestamp, request_id, session_id, user_id, user_role,
        requested_tool, action_type, decision, policy_rule,
        explanation, execution_time_ms, protected_mode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now(timezone.utc).isoformat(),
        request_id,
        session_id,
        user_id,
        user_role,
        requested_tool,
        action_type,
        decision,
        policy_rule,
        explanation,
        execution_time_ms,
        1 if protected_mode else 0
    ))
    conn.commit()
    conn.close()

def record_threat_incident(
    threat_category: str,
    severity: str,
    requested_action: str,
    decision: str,
    reason: str,
    user_id: str,
    user_role: str,
    payload_snippet: str
):
    """Records security incident into SQLite threat_incidents table."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO threat_incidents (
        timestamp, threat_category, severity, requested_action,
        decision, reason, user_id, user_role, payload_snippet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now(timezone.utc).isoformat(),
        threat_category,
        severity,
        requested_action,
        decision,
        reason,
        user_id,
        user_role,
        payload_snippet[:256]
    ))
    conn.commit()
    conn.close()

class SecurityGateway:
    """
    AgentShield Core Security Gateway.
    Guarantees that no tool execution or data retrieval occurs without:
    1. Direct & indirect injection scanning.
    2. RBAC role validation.
    3. Tool allowlist enforcement.
    4. Argument constraints checking.
    5. Cross-user scope protection (IDOR defense).
    6. Human confirmation token checks for sensitive actions.
    7. PII/credential scrubbing on outputs.
    8. Immutable audit logging.
    """

    @classmethod
    def execute_tool_safely(
        cls,
        tool_name: str,
        arguments: Dict[str, Any],
        user_id: str = "cust_001",
        user_role: str = "tier1_agent",
        session_id: str = "default-session",
        protected_mode: bool = True,
        confirmation_token: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> ToolExecutionTrace:
        start_time = time.perf_counter()
        req_id = request_id or str(uuid.uuid4())

        # Check for malformed or injection patterns in arguments
        args_str = str(arguments)
        is_inj, inj_cat, inj_sev, inj_reason = detect_prompt_injection(args_str)

        # UNPROTECTED SIMULATION MODE
        if not protected_mode:
            # In unprotected simulation mode, bypass gateway checks to demonstrate exploitability
            raw_output = None
            if tool_name in TOOL_DISPATCHER:
                try:
                    raw_output = TOOL_DISPATCHER[tool_name](arguments)
                except Exception as e:
                    raw_output = {"simulated_error": str(e)}
            else:
                raw_output = {"simulated_execution": f"Unprotected call to unvetted tool '{tool_name}' executed without policy check."}

            exec_time = (time.perf_counter() - start_time) * 1000

            trace = ToolExecutionTrace(
                tool_name=tool_name,
                arguments=arguments,
                decision=SecurityDecision.ALLOWED,
                policy_rule="UNPROTECTED_SIMULATION_BYPASS",
                reason="WARNING: Executed in Unprotected Simulation Mode without security gateway validation.",
                execution_time_ms=round(exec_time, 2),
                output=raw_output,
                sanitized_output=raw_output # No PII redaction in unprotected mode!
            )

            record_audit_log(
                request_id=req_id,
                session_id=session_id,
                user_id=user_id,
                user_role=user_role,
                requested_tool=tool_name,
                action_type="UNPROTECTED_EXECUTE",
                decision="ALLOWED",
                policy_rule="UNPROTECTED_SIMULATION",
                explanation="Executed in Unprotected Mode. Security Gateway was turned off.",
                execution_time_ms=round(exec_time, 2),
                protected_mode=False
            )
            return trace

        # PROTECTED MODE: Complete Security Enforcement
        # Check 1: Argument injection check
        if is_inj:
            exec_time = (time.perf_counter() - start_time) * 1000
            explanation = f"Blocked by AgentShield Gateway: {inj_reason}"
            trace = ToolExecutionTrace(
                tool_name=tool_name,
                arguments=arguments,
                decision=SecurityDecision.BLOCKED,
                policy_rule="MALICIOUS_ARGUMENT_INJECTION",
                reason=explanation,
                execution_time_ms=round(exec_time, 2),
                output=None,
                sanitized_output=None
            )
            record_audit_log(
                request_id=req_id,
                session_id=session_id,
                user_id=user_id,
                user_role=user_role,
                requested_tool=tool_name,
                action_type="TOOL_CALL_INTERCEPT",
                decision="BLOCKED",
                policy_rule="MALICIOUS_ARGUMENT_INJECTION",
                explanation=explanation,
                execution_time_ms=round(exec_time, 2),
                protected_mode=True
            )
            record_threat_incident(
                threat_category=inj_cat.value if inj_cat else "Malicious Input",
                severity=inj_sev.value if inj_sev else "HIGH",
                requested_action=f"Call tool '{tool_name}'",
                decision="BLOCKED",
                reason=explanation,
                user_id=user_id,
                user_role=user_role,
                payload_snippet=args_str
            )
            return trace

        # Check 2: Policy & RBAC & Scope Evaluation
        eval_result: PolicyEvaluationResult = evaluate_tool_policy(
            tool_name=tool_name,
            arguments=arguments,
            user_id=user_id,
            user_role=user_role,
            confirmation_token=confirmation_token
        )

        exec_time = (time.perf_counter() - start_time) * 1000

        if eval_result.decision == SecurityDecision.BLOCKED:
            trace = ToolExecutionTrace(
                tool_name=tool_name,
                arguments=arguments,
                decision=SecurityDecision.BLOCKED,
                policy_rule=eval_result.rule_name,
                reason=eval_result.reason,
                execution_time_ms=round(exec_time, 2),
                output=None,
                sanitized_output=None
            )
            record_audit_log(
                request_id=req_id,
                session_id=session_id,
                user_id=user_id,
                user_role=user_role,
                requested_tool=tool_name,
                action_type="TOOL_POLICY_ENFORCEMENT",
                decision="BLOCKED",
                policy_rule=eval_result.rule_name,
                explanation=eval_result.reason,
                execution_time_ms=round(exec_time, 2),
                protected_mode=True
            )
            severity = "HIGH" if "ROLE" in eval_result.rule_name or "ACCESS" in eval_result.rule_name else "MEDIUM"
            record_threat_incident(
                threat_category=ThreatCategory.UNAUTHORISED_TOOL_CALL.value if "CLEARANCE" in eval_result.rule_name else ThreatCategory.CROSS_USER_ACCESS.value,
                severity=severity,
                requested_action=f"Call tool '{tool_name}'",
                decision="BLOCKED",
                reason=eval_result.reason,
                user_id=user_id,
                user_role=user_role,
                payload_snippet=args_str
            )
            return trace

        if eval_result.decision == SecurityDecision.REQUIRES_CONFIRMATION:
            trace = ToolExecutionTrace(
                tool_name=tool_name,
                arguments=arguments,
                decision=SecurityDecision.REQUIRES_CONFIRMATION,
                policy_rule=eval_result.rule_name,
                reason=eval_result.reason,
                execution_time_ms=round(exec_time, 2),
                output={"status": "confirmation_pending", "expected_token": f"CONFIRM_{tool_name.upper()}_{user_id}"},
                sanitized_output={"status": "confirmation_pending", "expected_token": f"CONFIRM_{tool_name.upper()}_{user_id}"}
            )
            record_audit_log(
                request_id=req_id,
                session_id=session_id,
                user_id=user_id,
                user_role=user_role,
                requested_tool=tool_name,
                action_type="CONFIRMATION_CHECK",
                decision="REQUIRES_CONFIRMATION",
                policy_rule=eval_result.rule_name,
                explanation=eval_result.reason,
                execution_time_ms=round(exec_time, 2),
                protected_mode=True
            )
            return trace

        # Tool is APPROVED -> Dispatch to Mock Implementation
        raw_output = TOOL_DISPATCHER[tool_name](eval_result.sanitized_arguments)

        # Output Sanitization: Check for PII / Credential leak in output
        sanitized_output, was_redacted, redacted_cats = sanitize_json_payload(raw_output)

        exec_time = (time.perf_counter() - start_time) * 1000

        explanation = eval_result.reason
        if was_redacted:
            explanation += f" Sensitive data detected and redacted: {', '.join(redacted_cats)}."

        trace = ToolExecutionTrace(
            tool_name=tool_name,
            arguments=arguments,
            decision=SecurityDecision.ALLOWED,
            policy_rule=eval_result.rule_name,
            reason=explanation,
            execution_time_ms=round(exec_time, 2),
            output=raw_output,
            sanitized_output=sanitized_output
        )

        record_audit_log(
            request_id=req_id,
            session_id=session_id,
            user_id=user_id,
            user_role=user_role,
            requested_tool=tool_name,
            action_type="TOOL_EXECUTION_APPROVED",
            decision="ALLOWED",
            policy_rule=eval_result.rule_name,
            explanation=explanation,
            execution_time_ms=round(exec_time, 2),
            protected_mode=True
        )

        return trace
