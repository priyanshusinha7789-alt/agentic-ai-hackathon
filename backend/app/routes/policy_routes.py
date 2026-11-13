import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import PolicyRule, PolicyUpdate
from app.database import get_db, init_db

router = APIRouter(prefix="/policies", tags=["Security Policies"])

@router.get("", response_model=List[PolicyRule])
def get_all_policies():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM policies ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    policies = []
    for r in rows:
        constraints = {}
        if r["argument_constraints"]:
            try:
                constraints = json.loads(r["argument_constraints"])
            except Exception:
                constraints = {}

        policies.append(PolicyRule(
            id=r["id"],
            tool_name=r["tool_name"],
            description=r["description"],
            sensitivity_level=r["sensitivity_level"],
            min_required_role=r["min_required_role"],
            requires_confirmation=bool(r["requires_confirmation"]),
            is_enabled=bool(r["is_enabled"]),
            argument_constraints=constraints,
            pii_filtering_enabled=bool(r["pii_filtering_enabled"])
        ))
    return policies

@router.put("/{policy_id}", response_model=PolicyRule)
def update_policy(policy_id: int, update: PolicyUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM policies WHERE id = ?", (policy_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Policy #{policy_id} not found.")

    new_sensitivity = update.sensitivity_level if update.sensitivity_level is not None else existing["sensitivity_level"]
    new_role = update.min_required_role.value if update.min_required_role is not None else existing["min_required_role"]
    new_confirmation = int(update.requires_confirmation) if update.requires_confirmation is not None else existing["requires_confirmation"]
    new_enabled = int(update.is_enabled) if update.is_enabled is not None else existing["is_enabled"]
    new_pii = int(update.pii_filtering_enabled) if update.pii_filtering_enabled is not None else existing["pii_filtering_enabled"]
    
    new_constraints = existing["argument_constraints"]
    if update.argument_constraints is not None:
        new_constraints = json.dumps(update.argument_constraints)

    now_str = datetime.utcnow().isoformat()
    cursor.execute("""
    UPDATE policies SET
        sensitivity_level = ?,
        min_required_role = ?,
        requires_confirmation = ?,
        is_enabled = ?,
        pii_filtering_enabled = ?,
        argument_constraints = ?,
        updated_at = ?
    WHERE id = ?
    """, (new_sensitivity, new_role, new_confirmation, new_enabled, new_pii, new_constraints, now_str, policy_id))
    conn.commit()

    cursor.execute("SELECT * FROM policies WHERE id = ?", (policy_id,))
    updated = cursor.fetchone()
    conn.close()

    constraints = {}
    if updated["argument_constraints"]:
        try:
            constraints = json.loads(updated["argument_constraints"])
        except Exception:
            constraints = {}

    return PolicyRule(
        id=updated["id"],
        tool_name=updated["tool_name"],
        description=updated["description"],
        sensitivity_level=updated["sensitivity_level"],
        min_required_role=updated["min_required_role"],
        requires_confirmation=bool(updated["requires_confirmation"]),
        is_enabled=bool(updated["is_enabled"]),
        argument_constraints=constraints,
        pii_filtering_enabled=bool(updated["pii_filtering_enabled"])
    )

@router.post("/reset")
def reset_policies_to_defaults():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS policies")
    conn.commit()
    conn.close()
    init_db()
    return {"status": "success", "message": "All security policies reset to factory defaults."}
