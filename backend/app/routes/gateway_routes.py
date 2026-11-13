from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict, Optional
from app.security.gateway import SecurityGateway
from app.models.schemas import ToolExecutionTrace, SecurityDecision
from app.database import get_db

router = APIRouter(prefix="/gateway", tags=["Security Gateway"])

class DirectToolRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    user_id: Optional[str] = "cust_001"
    user_role: Optional[str] = "public"
    protected_mode: bool = True
    confirmation_token: Optional[str] = None

@router.get("/inspect")
def inspect_gateway_architecture():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM policies WHERE is_enabled = 1")
    active_tools = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM policies WHERE requires_confirmation = 1")
    sensitive_tools = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    total_audits = cursor.fetchone()[0]
    conn.close()

    return {
        "gateway_status": "ENFORCING",
        "version": "1.0.0-enterprise",
        "architecture_layers": [
            {
                "layer": 1,
                "name": "Input Prompt & Injection Scanner",
                "description": "Scans raw prompts and arguments for instruction resets, jailbreaks, hidden markup, and delimiter overrides.",
                "status": "ACTIVE"
            },
            {
                "layer": 2,
                "name": "Tool Allowlist & Registry Gate",
                "description": "Verifies that requested tool is explicitly registered and enabled in database policy.",
                "status": "ACTIVE"
            },
            {
                "layer": 3,
                "name": "Role-Based Access Control (RBAC)",
                "description": "Validates caller's clearance level against minimum role requirements (public < tier1_agent < supervisor < admin).",
                "status": "ACTIVE"
            },
            {
                "layer": 4,
                "name": "Resource Scope & IDOR Verifier",
                "description": "Prevents cross-user data tampering by enforcing user-to-resource ownership boundaries.",
                "status": "ACTIVE"
            },
            {
                "layer": 5,
                "name": "Human-in-the-Loop Confirmation Guard",
                "description": "Enforces confirmation token validation for high-risk operations (e.g. refunds, record purges).",
                "status": "ACTIVE"
            },
            {
                "layer": 6,
                "name": "Output PII & Credential Redaction Engine",
                "description": "Regex & heuristic scrubber that redacts credit cards, SSNs, API tokens, and JWTs from outgoing data.",
                "status": "ACTIVE"
            },
            {
                "layer": 7,
                "name": "Immutable SQLite Audit Ledger",
                "description": "Captures forensic records of every decision, latency, caller identity, and rationale.",
                "status": "ACTIVE"
            }
        ],
        "active_policies_count": active_tools,
        "sensitive_tools_requiring_confirmation": sensitive_tools,
        "audit_records_count": total_audits
    }

@router.post("/test-direct", response_model=ToolExecutionTrace)
def test_direct_tool_invocation(req: DirectToolRequest):
    """
    Direct tool invocation test endpoint.
    Demonstrates that hitting tool endpoints directly CANNOT bypass the gateway!
    The gateway validates permissions and policy regardless of caller origin.
    """
    trace = SecurityGateway.execute_tool_safely(
        tool_name=req.tool_name,
        arguments=req.arguments,
        user_id=req.user_id,
        user_role=req.user_role,
        protected_mode=req.protected_mode,
        confirmation_token=req.confirmation_token
    )

    if req.protected_mode and trace.decision == SecurityDecision.BLOCKED:
        # Return 403 Forbidden with details so attackers can see the block
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": f"Direct tool execution blocked by AgentShield Security Gateway: {trace.reason}",
                "trace": trace.dict()
            }
        )

    return trace
