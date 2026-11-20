import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.database import get_db

def search_knowledge_base(query: str) -> List[Dict[str, Any]]:
    """Searches synthetic knowledge base for articles matching query."""
    conn = get_db()
    cursor = conn.cursor()
    # Search title and content using safe parameterization
    cursor.execute(
        "SELECT id, title, category, content FROM knowledge_base WHERE title LIKE ? OR content LIKE ?",
        (f"%{query}%", f"%{query}%")
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_ticket_details(ticket_code: str) -> Dict[str, Any]:
    """Retrieves synthetic ticket details by ticket code."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets WHERE ticket_code = ?", (ticket_code,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"error": f"Ticket '{ticket_code}' not found in ticketing system."}

def create_ticket(title: str, description: str, customer_id: str, priority: str = "MEDIUM") -> Dict[str, Any]:
    """Creates a new synthetic ticket in the ticketing queue."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0]
    ticket_code = f"TCK-{1000 + count + 1}"
    now_str = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO tickets (ticket_code, customer_id, customer_name, title, description, status, priority, internal_notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_code,
        customer_id,
        f"Customer {customer_id}",
        title,
        description,
        "OPEN",
        priority.upper(),
        "Ticket created via AI Support Agent.",
        now_str
    ))
    conn.commit()
    conn.close()
    return {
        "status": "created",
        "ticket_code": ticket_code,
        "title": title,
        "priority": priority,
        "created_at": now_str
    }

def draft_response(ticket_code: str, draft_text: str) -> Dict[str, Any]:
    """Saves a draft response for a ticket."""
    return {
        "status": "draft_saved",
        "ticket_code": ticket_code,
        "draft_preview": draft_text,
        "timestamp": datetime.utcnow().isoformat(),
        "notes": "Draft staged for human agent review."
    }

def issue_refund(ticket_code: str, amount: float, reason: str) -> Dict[str, Any]:
    """Processes mock financial refund."""
    return {
        "status": "refund_approved",
        "ticket_code": ticket_code,
        "amount": amount,
        "reason": reason,
        "transaction_id": f"TXN-REF-{int(datetime.now(timezone.utc).timestamp())}",
        "gateway_approval": "CONFIRMED_BY_SUPERVISOR",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def delete_ticket(ticket_code: str) -> Dict[str, Any]:
    """Purges a ticket."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tickets WHERE ticket_code = ?", (ticket_code,))
    conn.commit()
    conn.close()
    return {
        "status": "ticket_deleted",
        "ticket_code": ticket_code,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Mock tool registry dispatcher
TOOL_DISPATCHER = {
    "search_knowledge_base": lambda args: search_knowledge_base(args.get("query", "")),
    "get_ticket_details": lambda args: get_ticket_details(args.get("ticket_code") or args.get("ticket_id", "")),
    "create_ticket": lambda args: create_ticket(
        args.get("title", "New Support Inquiry"),
        args.get("description", ""),
        args.get("customer_id", "cust_001"),
        args.get("priority", "MEDIUM")
    ),
    "draft_response": lambda args: draft_response(
        args.get("ticket_code", "TCK-1001"),
        args.get("draft_text", "")
    ),
    "issue_refund": lambda args: issue_refund(
        args.get("ticket_code", "TCK-1001"),
        float(args.get("amount", 0)),
        args.get("reason", "Customer request")
    ),
    "delete_ticket": lambda args: delete_ticket(
        args.get("ticket_code", "")
    ),
    "execute_raw_command": lambda args: {"error": "Mock execution rejected."},
    "dump_user_credentials": lambda args: {"error": "Mock credential dump rejected."}
}
