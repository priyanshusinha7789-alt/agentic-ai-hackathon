from fastapi import APIRouter
from app.models.schemas import DashboardStats, AuditLogItem, ThreatItem
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["Security Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_statistics():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Total security tests executed from simulation_runs table
    cursor.execute("SELECT COUNT(*) FROM simulation_runs")
    total_tests = cursor.fetchone()[0]

    # 2. Detected malicious inputs from threat_incidents table
    cursor.execute("SELECT COUNT(*) FROM threat_incidents")
    detected_malicious = cursor.fetchone()[0]

    # 3. Blocked unauthorized actions from audit_logs table
    cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE decision = 'BLOCKED'")
    blocked_actions = cursor.fetchone()[0]

    # 4. Allowed safe requests from audit_logs table
    cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE decision = 'ALLOWED'")
    allowed_requests = cursor.fetchone()[0]

    # 5. Recent security alerts count
    cursor.execute("SELECT COUNT(*) FROM threat_incidents WHERE severity IN ('HIGH', 'CRITICAL')")
    recent_alerts_count = cursor.fetchone()[0]

    # 6. Attack category distribution (from threat_incidents & simulation_runs)
    cursor.execute("""
    SELECT threat_category, COUNT(*) as count 
    FROM threat_incidents 
    GROUP BY threat_category
    """)
    cat_rows = cursor.fetchall()
    category_distribution = []
    if cat_rows:
        category_distribution = [{"name": r["threat_category"], "value": r["count"]} for r in cat_rows]
    else:
        # Check simulation_runs if threat_incidents empty
        cursor.execute("""
        SELECT category, COUNT(*) as count 
        FROM simulation_runs 
        WHERE category != 'Benign Request'
        GROUP BY category
        """)
        sim_rows = cursor.fetchall()
        category_distribution = [{"name": r["category"], "value": r["count"]} for r in sim_rows]

    # 7. Security activity timeline (aggregated by hour/minute from audit_logs)
    cursor.execute("""
    SELECT substr(timestamp, 1, 16) as time_slot,
           SUM(CASE WHEN decision = 'BLOCKED' THEN 1 ELSE 0 END) as blocked,
           SUM(CASE WHEN decision = 'ALLOWED' THEN 1 ELSE 0 END) as allowed
    FROM audit_logs
    GROUP BY time_slot
    ORDER BY time_slot ASC
    LIMIT 20
    """)
    timeline_rows = cursor.fetchall()
    activity_timeline = []
    for r in timeline_rows:
        activity_timeline.append({
            "timestamp": r["time_slot"],
            "blocked": r["blocked"],
            "allowed": r["allowed"]
        })

    # 8. Recent audit events (latest 5)
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5")
    recent_audits = [AuditLogItem(
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
    ) for r in cursor.fetchall()]

    # 9. Recent threats (latest 5)
    cursor.execute("SELECT * FROM threat_incidents ORDER BY id DESC LIMIT 5")
    recent_threats = [ThreatItem(
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
    ) for r in cursor.fetchall()]

    conn.close()

    return DashboardStats(
        total_tests_executed=total_tests,
        detected_malicious_inputs=detected_malicious,
        blocked_unauthorised_actions=blocked_actions,
        allowed_safe_requests=allowed_requests,
        recent_alerts_count=recent_alerts_count,
        attack_category_distribution=category_distribution,
        security_activity_timeline=activity_timeline,
        recent_audit_events=recent_audits,
        recent_threats=recent_threats
    )
