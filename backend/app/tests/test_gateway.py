import pytest
from app.database import init_db
from app.security.gateway import SecurityGateway
from app.models.schemas import SecurityDecision, UserRole
from app.agent.demo_agent import DemoSupportAgent, ChatRequest

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_gateway_blocks_disabled_tool():
    # Attempt direct execution of honeypot tool
    trace = SecurityGateway.execute_tool_safely(
        tool_name="dump_user_credentials",
        arguments={"user_id": "cust_001"},
        user_id="cust_001",
        user_role="tier1_agent",
        protected_mode=True
    )
    assert trace.decision == SecurityDecision.BLOCKED
    assert "disabled" in trace.reason.lower() or "not registered" in trace.reason.lower()

def test_gateway_enforces_rbac_clearance():
    # Public role user attempting to delete a ticket
    trace = SecurityGateway.execute_tool_safely(
        tool_name="delete_ticket",
        arguments={"ticket_code": "TCK-1001"},
        user_id="cust_001",
        user_role="public",
        protected_mode=True
    )
    assert trace.decision == SecurityDecision.BLOCKED
    assert "clearance" in trace.reason.lower() or "role" in trace.reason.lower()

def test_gateway_sensitive_action_requires_confirmation():
    # Supervisor attempting refund without confirmation token
    trace = SecurityGateway.execute_tool_safely(
        tool_name="issue_refund",
        arguments={"ticket_code": "TCK-1001", "amount": 75.0, "reason": "Accidental charge"},
        user_id="supervisor_01",
        user_role="supervisor",
        protected_mode=True,
        confirmation_token=None
    )
    assert trace.decision == SecurityDecision.REQUIRES_CONFIRMATION

def test_gateway_allows_with_valid_confirmation():
    # Supervisor with valid confirmation token
    token = "CONFIRM_ISSUE_REFUND_supervisor_01"
    trace = SecurityGateway.execute_tool_safely(
        tool_name="issue_refund",
        arguments={"ticket_code": "TCK-1001", "amount": 75.0, "reason": "Accidental charge"},
        user_id="supervisor_01",
        user_role="supervisor",
        protected_mode=True,
        confirmation_token=token
    )
    assert trace.decision == SecurityDecision.ALLOWED
    assert trace.output["status"] == "refund_approved"

def test_pii_sanitization_on_ticket_output():
    # TCK-1002 has an internal note with secret API token 'secret_sk_test_98374a81'
    trace = SecurityGateway.execute_tool_safely(
        tool_name="get_ticket_details",
        arguments={"ticket_code": "TCK-1002"},
        user_id="agent_01",
        user_role="tier1_agent",
        protected_mode=True
    )
    assert trace.decision == SecurityDecision.ALLOWED
    assert "[REDACTED_API_KEY]" in trace.sanitized_output["internal_notes"]
    assert "secret_sk_test" not in trace.sanitized_output["internal_notes"]
