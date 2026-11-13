import re
from typing import Tuple, List, Dict, Any

# Regular expressions for sensitive PII and credential patterns
PATTERNS = {
    "CREDIT_CARD": r"\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b",
    "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
    "API_KEY": r"\b(?:sk_[live|test]_[a-zA-Z0-9]{20,40}|secret_[a-zA-Z0-9_\-]{16,}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35})\b",
    "PASSWORD_IN_TEXT": r"(?i)\b(?:password|passwd|pwd|secret_key)\s*[:=]\s*['\"]?([^\s'\"]{6,})['\"]?",
    "JWT_TOKEN": r"\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b",
}

def scan_for_pii(text: str) -> List[Dict[str, Any]]:
    """Scans text and returns all detected sensitive data categories."""
    findings = []
    if not isinstance(text, str):
        return findings

    for category, regex in PATTERNS.items():
        matches = list(re.finditer(regex, text))
        for m in matches:
            matched_text = m.group(0)
            # Filter false positives for credit card: must have at least 13 digits
            if category == "CREDIT_CARD":
                digits = re.sub(r"\D", "", matched_text)
                if len(digits) < 13 or len(digits) > 19:
                    continue
            findings.append({
                "category": category,
                "matched_sample": matched_text[:3] + "..." + matched_text[-3:] if len(matched_text) > 6 else "***",
                "start": m.start(),
                "end": m.end()
            })
    return findings

def redact_sensitive_data(text: str) -> Tuple[str, bool, List[str]]:
    """
    Redacts sensitive PII and secrets with security mask placeholders.
    Returns: (redacted_text, was_redacted, list_of_redacted_categories)
    """
    if not isinstance(text, str):
        return text, False, []

    redacted = text
    categories_found = set()

    # Redact API Keys
    api_key_matches = list(re.finditer(PATTERNS["API_KEY"], redacted))
    for m in reversed(api_key_matches):
        redacted = redacted[:m.start()] + "[REDACTED_API_KEY]" + redacted[m.end():]
        categories_found.add("API_KEY")

    # Redact JWTs
    jwt_matches = list(re.finditer(PATTERNS["JWT_TOKEN"], redacted))
    for m in reversed(jwt_matches):
        redacted = redacted[:m.start()] + "[REDACTED_JWT_TOKEN]" + redacted[m.end():]
        categories_found.add("JWT_TOKEN")

    # Redact SSN
    ssn_matches = list(re.finditer(PATTERNS["SSN"], redacted))
    for m in reversed(ssn_matches):
        redacted = redacted[:m.start()] + "[REDACTED_SSN]" + redacted[m.end():]
        categories_found.add("SSN")

    # Redact Credit Cards
    cc_matches = list(re.finditer(PATTERNS["CREDIT_CARD"], redacted))
    for m in reversed(cc_matches):
        digits = re.sub(r"\D", "", m.group(0))
        if 13 <= len(digits) <= 19:
            redacted = redacted[:m.start()] + "[REDACTED_CARD_NUMBER]" + redacted[m.end():]
            categories_found.add("CREDIT_CARD")

    # Redact password expressions
    pwd_matches = list(re.finditer(PATTERNS["PASSWORD_IN_TEXT"], redacted))
    for m in reversed(pwd_matches):
        redacted = redacted[:m.start()] + "password: [REDACTED_SECRET]" + redacted[m.end():]
        categories_found.add("PASSWORD")

    return redacted, len(categories_found) > 0, list(categories_found)

def sanitize_json_payload(data: Any) -> Tuple[Any, bool, List[str]]:
    """Recursively walks a JSON/dict structure to redact sensitive strings."""
    categories_all = []
    any_redacted = False

    if isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                sanitized_val, was_redacted, cats = sanitize_json_payload(v)
                new_dict[k] = sanitized_val
                if was_redacted:
                    any_redacted = True
                    categories_all.extend(cats)
            elif isinstance(v, str):
                sanitized_val, was_redacted, cats = redact_sensitive_data(v)
                new_dict[k] = sanitized_val
                if was_redacted:
                    any_redacted = True
                    categories_all.extend(cats)
            else:
                new_dict[k] = v
        return new_dict, any_redacted, list(set(categories_all))
    elif isinstance(data, list):
        new_list = []
        for item in data:
            if isinstance(item, (dict, list, str)):
                sanitized_item, was_redacted, cats = sanitize_json_payload(item)
                new_list.append(sanitized_item)
                if was_redacted:
                    any_redacted = True
                    categories_all.extend(cats)
            else:
                new_list.append(item)
        return new_list, any_redacted, list(set(categories_all))
    elif isinstance(data, str):
        return redact_sensitive_data(data)
    else:
        return data, False, []
