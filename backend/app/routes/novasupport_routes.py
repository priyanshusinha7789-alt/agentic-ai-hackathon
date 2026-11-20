import time
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    NovaSupportAnalyzeRequest,
    NovaSupportAnalyzeResponse,
    NovaSupportExecutionResult,
    ChatRequest,
    UserRole
)
from app.security.gemini_analyzer import analyze_security_input
from app.security.gateway import record_audit_log, record_threat_incident
from app.agent.demo_agent import DemoSupportAgent

router = APIRouter(prefix="/novasupport", tags=["NovaSupport AI"])

@router.post("/analyze", response_model=NovaSupportAnalyzeResponse)
def analyze_custom_input(req: NovaSupportAnalyzeRequest):
    """
    NovaSupport AI Dynamic Security Analysis Endpoint.
    Analyzes arbitrary user-provided text (or predefined scenarios) using
    Google Gemini API with structured output, backed by a deterministic rule-based fallback.
    """
    start_time = time.perf_counter()
    request_id = f"REQ-{uuid.uuid4().hex[:7].upper()}"
    role_str = req.user_role.value if isinstance(req.user_role, UserRole) else (req.user_role or "tier1_agent")
    user_id = req.user_id or "cust_001"
    session_id = req.session_id or "novasupport-session"
    raw_text = req.text.strip() if req.text else ""

    try:
        # Phase 1-4: Execute Gemini AI (or Deterministic Fallback) Security Analysis
        analysis = analyze_security_input(
            text=raw_text,
            user_role=role_str,
            protected_mode=req.protected_mode
        )

        # Detect planned target tool
        intent_tuple = DemoSupportAgent.parse_user_intent_and_tool(raw_text, user_id)
        target_tool = intent_tuple[0] if intent_tuple else "novasupport_input"
        tool_traces = []

        # Phase 5: Enforce Security Policy
        if req.protected_mode:
            # Protected Mode: Active Gateway Enforces Blocking on Attacks
            if analysis.is_attack or analysis.recommended_action in ("BLOCK", "FLAG") or analysis.risk_level in ("HIGH", "CRITICAL"):
                status = "BLOCKED"
                policy_decision = "BLOCKED"
                agent_response = (
                    f"[AgentShield Gateway Interception]: Prohibited action. "
                    f"Identified as {analysis.classification} ({analysis.risk_level} risk). "
                    f"{analysis.summary}"
                )
            else:
                # Benign input: Execute standard customer support workflow
                chat_res = DemoSupportAgent.process_chat(ChatRequest(
                    message=raw_text,
                    user_id=user_id,
                    user_role=req.user_role,
                    protected_mode=True,
                    session_id=session_id
                ))
                status = "ALLOWED" if chat_res.status == "success" else chat_res.status.upper()
                policy_decision = "ALLOWED" if status == "ALLOWED" else "BLOCKED"
                agent_response = chat_res.response
                tool_traces = chat_res.tool_traces
        else:
            # Unprotected Mode: Simulation allows exploit to demonstrate vulnerability
            if analysis.is_attack:
                status = "ALLOWED (EXPLOIT SUCCEEDED)"
                policy_decision = "SIMULATED_EXPLOIT"
                agent_response = (
                    f"[UNPROTECTED SIMULATION]: Gateway bypassed. "
                    f"Adversarial payload was accepted into the agent context: '{raw_text[:80]}...'"
                )
            else:
                chat_res = DemoSupportAgent.process_chat(ChatRequest(
                    message=raw_text,
                    user_id=user_id,
                    user_role=req.user_role,
                    protected_mode=False,
                    session_id=session_id
                ))
                status = "ALLOWED"
                policy_decision = "ALLOWED"
                agent_response = chat_res.response
                tool_traces = chat_res.tool_traces

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Phase 6: Immutable Forensic Audit Logging
        record_audit_log(
            request_id=request_id,
            session_id=session_id,
            user_id=user_id,
            user_role=role_str,
            requested_tool=target_tool,
            action_type=analysis.classification,
            decision=policy_decision,
            policy_rule=f"AGENTSHIELD_{analysis.detection_method}_{analysis.classification}",
            explanation=analysis.reasoning_summary,
            execution_time_ms=elapsed_ms,
            protected_mode=req.protected_mode
        )

        # Log threat incident if attack detected
        if analysis.is_attack:
            record_threat_incident(
                threat_category=analysis.attack_category or analysis.classification,
                severity=analysis.risk_level,
                requested_action=target_tool,
                decision=policy_decision,
                reason=analysis.summary,
                user_id=user_id,
                user_role=role_str,
                payload_snippet=raw_text[:200]
            )

        execution_result = NovaSupportExecutionResult(
            status=status,
            policy_decision=policy_decision,
            response=agent_response,
            target_tool=target_tool,
            tool_traces=tool_traces,
            request_id=request_id,
            execution_time_ms=elapsed_ms
        )

        return NovaSupportAnalyzeResponse(
            success=True,
            analysis=analysis,
            execution=execution_result,
            error=None
        )

    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        # Fallback error response - never crash the application
        fallback_analysis = analyze_security_input(raw_text, role_str, req.protected_mode)
        return NovaSupportAnalyzeResponse(
            success=False,
            analysis=fallback_analysis,
            execution=NovaSupportExecutionResult(
                status="ERROR",
                policy_decision="ERROR",
                response=f"Analysis encountered an internal error: {str(e)}",
                target_tool="error_handler",
                tool_traces=[],
                request_id=request_id,
                execution_time_ms=elapsed_ms
            ),
            error=str(e)
        )
