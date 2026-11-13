from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.agent.demo_agent import DemoSupportAgent
from app.database import get_db

router = APIRouter(prefix="/agent", tags=["Agent"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(req: ChatRequest):
    try:
        return DemoSupportAgent.process_chat(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/state")
def get_agent_state():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM knowledge_base")
    kb_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM tickets")
    ticket_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM policies WHERE is_enabled = 1")
    enabled_tools = cursor.fetchone()[0]
    conn.close()
    return {
        "agent_name": "NovaSupport AI",
        "version": "1.0.0",
        "status": "ONLINE",
        "knowledge_base_articles": kb_count,
        "active_tickets": ticket_count,
        "protected_tools_count": enabled_tools,
        "security_engine": "AgentShield Gateway v1.0"
    }
