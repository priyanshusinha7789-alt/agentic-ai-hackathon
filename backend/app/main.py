from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes.agent_routes import router as agent_router
from app.routes.simulation_routes import router as simulation_router
from app.routes.gateway_routes import router as gateway_router
from app.routes.policy_routes import router as policy_router
from app.routes.threat_routes import router as threat_router
from app.routes.audit_routes import router as audit_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.benchmark_routes import router as benchmark_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables & default policies/knowledge base on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Your AI Agent's Firewall Against Manipulation - Enterprise AI Security Gateway",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes (both with and without /api prefix for local and serverless compatibility)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(gateway_router, prefix=settings.API_V1_STR)
app.include_router(policy_router, prefix=settings.API_V1_STR)
app.include_router(threat_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(benchmark_router, prefix=settings.API_V1_STR)

app.include_router(agent_router)
app.include_router(simulation_router)
app.include_router(gateway_router)
app.include_router(policy_router)
app.include_router(threat_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(benchmark_router)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Your AI Agent's Firewall Against Manipulation",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "gateway": "ACTIVE"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
