from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import ThreatItem
from app.database import get_db

router = APIRouter(prefix="/threats", tags=["Threat Explorer"])

@router.get("", response_model=List[ThreatItem])
def get_threats(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    decision: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=500)
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM threat_incidents WHERE 1=1"
    params = []

    if severity:
        query += " AND severity = ?"
        params.append(severity.upper())
    if category:
        query += " AND threat_category = ?"
        params.append(category)
    if decision:
        query += " AND decision = ?"
        params.append(decision.upper())
    if search:
        query += " AND (reason LIKE ? OR payload_snippet LIKE ? OR requested_action LIKE ?)"
        like_term = f"%{search}%"
        params.extend([like_term, like_term, like_term])

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [ThreatItem(
        id=r["id"],
        timestamp=r["timestamp"],
        threat_category=r["threat_category"],
        severity=r["severity"],
        requested_action=r["requested_action"],
        decision=r["decision"],
        reason=r["reason"],
        user_id=r["user_id"],
        user_role=r["user_role"],
        payload_snippet=r["payload_snippet"]
    ) for r in rows]

@router.get("/analytics")
def get_threat_analytics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT severity, COUNT(*) as count FROM threat_incidents GROUP BY severity
    """)
    severity_counts = {r["severity"]: r["count"] for r in cursor.fetchall()}

    cursor.execute("""
    SELECT threat_category, COUNT(*) as count FROM threat_incidents GROUP BY threat_category
    """)
    category_counts = [{ "category": r["threat_category"], "count": r["count"] } for r in cursor.fetchall()]

    conn.close()

    return {
        "severity_distribution": severity_counts,
        "category_distribution": category_counts
    }
