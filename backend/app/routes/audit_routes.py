import csv
import io
from fastapi import APIRouter, Query, Response
from typing import List, Optional
from app.models.schemas import AuditLogItem
from app.database import get_db

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogItem])
def get_audit_logs(
    decision: Optional[str] = None,
    tool: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=1000)
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM audit_logs WHERE 1=1"
    params = []

    if decision:
        query += " AND decision = ?"
        params.append(decision.upper())
    if tool:
        query += " AND requested_tool = ?"
        params.append(tool)
    if search:
        query += " AND (explanation LIKE ? OR policy_rule LIKE ? OR request_id LIKE ? OR user_id LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [AuditLogItem(
        id=r["id"],
        timestamp=r["timestamp"],
        request_id=r["request_id"],
        session_id=r["session_id"],
        user_id=r["user_id"],
        user_role=r["user_role"],
        requested_tool=r["requested_tool"],
        action_type=r["action_type"],
        decision=r["decision"],
        policy_rule=r["policy_rule"],
        explanation=r["explanation"],
        execution_time_ms=r["execution_time_ms"],
        protected_mode=bool(r["protected_mode"])
    ) for r in rows]

@router.get("/export.csv")
def export_audit_logs_csv():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Timestamp (UTC)", "Request ID", "Session ID", "User ID",
        "Role", "Requested Tool", "Action Type", "Decision",
        "Policy Rule", "Execution Time (ms)", "Protected Mode", "Explanation"
    ])

    for r in rows:
        writer.writerow([
            r["id"], r["timestamp"], r["request_id"], r["session_id"], r["user_id"],
            r["user_role"], r["requested_tool"], r["action_type"], r["decision"],
            r["policy_rule"], r["execution_time_ms"], "YES" if r["protected_mode"] else "NO",
            r["explanation"]
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agentshield_audit_logs.csv"}
    )

@router.delete("/clear")
def clear_audit_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM audit_logs")
    cursor.execute("DELETE FROM threat_incidents")
    conn.commit()
    conn.close()
    return {"status": "cleared", "message": "Audit records and threat logs cleared."}
