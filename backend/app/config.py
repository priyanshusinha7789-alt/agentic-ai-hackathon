import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AgentShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "/tmp/agentshield.db" if os.getenv("VERCEL") else "agentshield.db"
    )
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    
    # Gemini API configuration for NovaSupport AI security analysis
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    USE_MOCK_LLM: bool = os.getenv("USE_MOCK_LLM", "False").lower() in ("true", "1")

settings = Settings()
