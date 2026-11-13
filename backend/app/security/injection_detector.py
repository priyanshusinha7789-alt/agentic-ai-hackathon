import re
import base64
from typing import Tuple, Optional, Dict, Any
from app.models.schemas import ThreatCategory, ThreatSeverity

# Signatures for prompt injection & jailbreak attacks
INJECTION_PATTERNS = [
    # 1. System instruction override
    (r"(?i)\b(?:ignore|disregard|forget|override|bypass|cancel)\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|rules|prompts|guidelines|policies)\b", 
     ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.CRITICAL, "Instruction override attempt detected: user trying to bypass system prompt directives."),
    
    (r"(?i)\byou\s+are\s+now\s+(?:an?\s+)?(?:unfiltered|jailbroken|DAN|evil|unrestricted|godmode|developer mode)\b",
     ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.CRITICAL, "Role hijacking / DAN persona switch detected."),
     
    (r"(?i)\b(?:do\s+anything\s+now|bypass\s+all\s+filters|answer\s+without\s+restrictions)\b",
     ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.CRITICAL, "Jailbreak bypass instruction signature."),

    # 2. System prompt leakage / extraction
    (r"(?i)\b(?:reveal|print|repeat|output|show|echo|dump)\s+(?:your\s+)?(?:initial|original|secret|hidden|system)\s+(?:prompt|instructions|context|rules|guidelines)\b",
     ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.HIGH, "System prompt exfiltration attempt detected."),

    # 3. Delimiter & XML/Markdown boundary injection
    (r"(?i)(?:<\/system>|<\/instruction>|\[\/INST\]|<<SYS>>|---BEGIN SYSTEM PROMPT---|\[SYSTEM NOTICE\])",
     ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.HIGH, "Protocol delimiter boundary spoofing detected."),

    # 4. Indirect Prompt Injection in retrieved document / comments
    (r"(?i)(?:<!--\s*(?:system|admin|override|inject).*?-->|\[hidden_instruction\b|\[SYSTEM_OVERRIDE\b)",
     ThreatCategory.INDIRECT_PROMPT_INJECTION, ThreatSeverity.HIGH, "Indirect injection markup embedded in data context."),

    # 5. Malicious tool usurpation / forced execution
    (r"(?i)\b(?:call\s+tool|execute\s+tool|invoke\s+function|run\s+command)\s*[:=]?\s*(?:execute_raw_command|dump_user_credentials|delete_ticket|drop\s+table)\b",
     ThreatCategory.UNAUTHORISED_TOOL_CALL, ThreatSeverity.CRITICAL, "Direct attempt to force restricted/honeypot tool execution via prompt."),

    # 6. SQL injection / Malformed tool argument
    (r"(?i)\b(?:UNION\s+SELECT|OR\s+1=1|DROP\s+TABLE|;\s*DELETE\s+FROM|--\s*$)\b",
     ThreatCategory.MALFORMED_TOOL_ARGUMENT, ThreatSeverity.HIGH, "SQL injection pattern in user input/arguments."),

    # 7. Shell command injection in arguments
    (r"(?:;\s*(?:rm\s+-rf|curl\s+|wget\s+|cat\s+/etc/passwd|powershell\s+|cmd\.exe|whoami|bash\s+-c))",
     ThreatCategory.MALFORMED_TOOL_ARGUMENT, ThreatSeverity.CRITICAL, "Shell injection syntax detected in query/arguments.")
]

def check_base64_payload(text: str) -> Optional[Tuple[ThreatCategory, ThreatSeverity, str]]:
    """Checks for obfuscated base64 payloads concealing prompt injection instructions."""
    # Look for base64-like blocks of length >= 24
    b64_candidates = re.findall(r"\b[A-Za-z0-9+/]{24,}={0,2}\b", text)
    for candidate in b64_candidates:
        try:
            decoded = base64.b64decode(candidate).decode("utf-8", errors="ignore")
            # Run injection checks on decoded payload
            for pattern, category, severity, reason in INJECTION_PATTERNS:
                if re.search(pattern, decoded):
                    return (category, severity, f"Obfuscated Base64 injection detected: {reason}")
        except Exception:
            pass
    return None

def detect_prompt_injection(user_input: str) -> Tuple[bool, Optional[ThreatCategory], Optional[ThreatSeverity], Optional[str]]:
    """
    Analyzes input string for prompt injection, jailbreaks, delimiter abuse,
    obfuscated payloads and unauthorized tool force-calls.
    
    Returns: (is_malicious, category, severity, explanation)
    """
    if not user_input or not isinstance(user_input, str):
        return False, None, None, None

    # 1. Direct Pattern Matching
    for pattern, category, severity, explanation in INJECTION_PATTERNS:
        if re.search(pattern, user_input):
            return True, category, severity, explanation

    # 2. Obfuscation & Base64 Inspection
    b64_check = check_base64_payload(user_input)
    if b64_check:
        category, severity, explanation = b64_check
        return True, category, severity, explanation

    # 3. Delimiter repetition / Prompt stuffing heuristic
    if user_input.count("---") > 6 or user_input.count("```") > 4:
        return True, ThreatCategory.DIRECT_PROMPT_INJECTION, ThreatSeverity.MEDIUM, "Anomalous delimiter density indicating structured escape attempt."

    return False, None, None, None
