import json
import re
from typing import Any, Dict, Optional, Tuple
from app.database import get_db
from app.security.rbac import is_role_authorized, validate_resource_scope
from app.models.schemas import SecurityDecision, UserRole

class PolicyEvaluationResult:
    def __init__(
        self,
        decision: SecurityDecision,
        rule_name: str,
        reason: str,
        sanitized_arguments: Optional[Dict[str, Any]] = None,
        confirmation_needed: bool = False
    ):
        self.decision = decision
        self.rule_name = rule_name
        self.reason = reason
        self.sanitized_arguments = sanitized_arguments or {}
        self.confirmation_needed = confirmation_needed

def get_policy_for_tool(tool_name: str) -> Optional[Dict[str, Any]]:
    """Fetches policy record for tool from SQLite database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM policies WHERE tool_name = ?", (tool_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def evaluate_tool_policy(
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: str,
    user_role: str,
    confirmation_token: Optional[str] = None
) -> PolicyEvaluationResult:
    """
    Evaluates requested tool execution against backend policy rules.
    Enforces allowlisting, RBAC clearance, argument constraints,
    resource scope (IDOR prevention), and human confirmation tokens.
    """
    policy = get_policy_for_tool(tool_name)

    # 1. Tool Allowlist Check
    if not policy:
        return PolicyEvaluationResult(
            decision=SecurityDecision.BLOCKED,
            rule_name="TOOL_NOT_ALLOWLISTED",
            reason=f"Tool '{tool_name}' is not registered in the security policy allowlist."
        )

    # 2. Tool Disabled Check
    if not policy["is_enabled"]:
        return PolicyEvaluationResult(
            decision=SecurityDecision.BLOCKED,
            rule_name="TOOL_DISABLED",
            reason=f"Tool '{tool_name}' has been disabled by security policy (Sensitivity: {policy['sensitivity_level']})."
        )

    # 3. RBAC Role Clearance Check
    required_role = policy["min_required_role"]
    if not is_role_authorized(user_role, required_role):
        return PolicyEvaluationResult(
            decision=SecurityDecision.BLOCKED,
            rule_name="INSUFFICIENT_ROLE_CLEARANCE",
            reason=f"User role '{user_role}' does not meet minimum required clearance '{required_role}' for tool '{tool_name}'."
        )

    # Parse argument constraints
    constraints = {}
    if policy.get("argument_constraints"):
        try:
            constraints = json.loads(policy["argument_constraints"])
        except Exception:
            constraints = {}

    sanitized_args = dict(arguments)

    # 4. Tool-Specific Constraint & Scope Enforcement
    if tool_name == "get_ticket_details":
        requested_ticket_code = arguments.get("ticket_code") or arguments.get("ticket_id")
        if not requested_ticket_code:
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="MISSING_REQUIRED_ARGUMENT",
                reason="Ticket lookup requires a valid 'ticket_code'."
            )
        # Check argument length
        if len(str(requested_ticket_code)) > constraints.get("max_ticket_id_length", 32):
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="ARGUMENT_LENGTH_EXCEEDED",
                reason="Ticket code exceeds maximum allowed length constraint."
            )
        # Check cross-user access (IDOR) if user is public customer
        if user_role == UserRole.PUBLIC:
            # Query ticket to check ownership
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT customer_id FROM tickets WHERE ticket_code = ?", (requested_ticket_code,))
            ticket_row = cur.fetchone()
            conn.close()
            if ticket_row and ticket_row["customer_id"] != user_id:
                return PolicyEvaluationResult(
                    decision=SecurityDecision.BLOCKED,
                    rule_name="CROSS_USER_ACCESS_VIOLATION",
                    reason=f"Cross-Tenant Access Blocked: User '{user_id}' is not authorized to inspect ticket '{requested_ticket_code}' belonging to '{ticket_row['customer_id']}'."
                )

    elif tool_name == "search_knowledge_base":
        query = arguments.get("query", "")
        max_q_len = constraints.get("max_query_length", 256)
        if len(str(query)) > max_q_len:
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="ARGUMENT_LENGTH_EXCEEDED",
                reason=f"Knowledge base search query exceeds max allowed length ({len(str(query))} > {max_q_len})."
            )

    elif tool_name == "issue_refund":
        amount = arguments.get("amount", 0)
        try:
            amount_val = float(amount)
        except (ValueError, TypeError):
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="MALFORMED_ARGUMENT_TYPE",
                reason="Refund amount must be a valid positive numerical value."
            )
        if amount_val <= 0:
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="INVALID_FINANCIAL_AMOUNT",
                reason="Refund amount must be greater than zero."
            )
        max_limit = constraints.get("max_amount", 500.0)
        if amount_val > max_limit and user_role != UserRole.ADMIN:
            return PolicyEvaluationResult(
                decision=SecurityDecision.BLOCKED,
                rule_name="FINANCIAL_LIMIT_EXCEEDED",
                reason=f"Refund amount ${amount_val:.2f} exceeds standard supervisor limit ${max_limit:.2f}. Requires Admin clearance."
            )

    # 5. Sensitive Action Confirmation Check (Human-in-the-Loop)
    if policy.get("requires_confirmation"):
        valid_token = f"CONFIRM_{tool_name.upper()}_{user_id}"
        if confirmation_token != valid_token:
            return PolicyEvaluationResult(
                decision=SecurityDecision.REQUIRES_CONFIRMATION,
                rule_name="HUMAN_CONFIRMATION_REQUIRED",
                reason=f"Tool '{tool_name}' is classified as High/Critical sensitivity. Human supervisor confirmation token required.",
                confirmation_needed=True,
                sanitized_arguments=sanitized_args
            )

    # All policy checks passed!
    return PolicyEvaluationResult(
        decision=SecurityDecision.ALLOWED,
        rule_name="POLICY_PASSED",
        reason=f"Request verified by AgentShield Gateway. Clearance: {user_role}. Constraints validated.",
        sanitized_arguments=sanitized_args
    )
