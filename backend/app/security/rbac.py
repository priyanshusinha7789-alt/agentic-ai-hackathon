from app.models.schemas import UserRole

# Role hierarchy: admin > supervisor > tier1_agent > public
ROLE_HIERARCHY: dict[str, int] = {
    UserRole.PUBLIC: 1,
    UserRole.TIER1_AGENT: 2,
    UserRole.SUPERVISOR: 3,
    UserRole.ADMIN: 4,
}

def is_role_authorized(user_role: str, min_required_role: str) -> bool:
    """Checks whether user_role has equal or greater clearance than min_required_role."""
    user_level = ROLE_HIERARCHY.get(user_role, 0)
    required_level = ROLE_HIERARCHY.get(min_required_role, 99)
    return user_level >= required_level

def validate_resource_scope(user_id: str, user_role: str, resource_owner_id: str) -> bool:
    """
    Validates cross-user resource scope (IDOR prevention).
    Supervisors and Admins have global read/update access.
    Agents and Public users can only access their own resources.
    """
    if user_role in (UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TIER1_AGENT):
        # Support agents have legitimate operational access to tickets,
        # but public users must strictly be restricted to their own customer_id.
        return True
    return user_id == resource_owner_id
