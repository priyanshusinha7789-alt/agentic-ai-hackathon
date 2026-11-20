from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
from app.routes.novasupport_routes import router as novasupport_router

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
app.include_router(novasupport_router, prefix=settings.API_V1_STR)

app.include_router(agent_router)
app.include_router(simulation_router)
app.include_router(gateway_router)
app.include_router(policy_router)
app.include_router(threat_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(benchmark_router)
app.include_router(novasupport_router)

# Resolve public static directory for serving frontend bundle
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
if not os.path.exists(PUBLIC_DIR):
    PUBLIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")

ASSETS_DIR = os.path.join(PUBLIC_DIR, "assets")
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/favicon.svg")
def serve_favicon():
    fav = os.path.join(PUBLIC_DIR, "favicon.svg")
    if os.path.exists(fav):
        return FileResponse(fav, media_type="image/svg+xml")
    raise HTTPException(status_code=404)

@app.get("/icons.svg")
def serve_icons():
    ico = os.path.join(PUBLIC_DIR, "icons.svg")
    if os.path.exists(ico):
        return FileResponse(ico, media_type="image/svg+xml")
    raise HTTPException(status_code=404)

@app.get("/api")
def api_info():
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

@app.get("/")
def serve_root():
    index_path = os.path.join(PUBLIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Your AI Agent's Firewall Against Manipulation",
        "version": settings.VERSION,
        "status": "OPERATIONAL"
    }

@app.get("/{full_path:path}")
def serve_frontend_spa(full_path: str):
    # If file exists in public dir, serve it directly
    target_file = os.path.join(PUBLIC_DIR, full_path)
    if os.path.exists(target_file) and os.path.isfile(target_file):
        return FileResponse(target_file)
    # Otherwise return index.html for React SPA client-side routing
    index_path = os.path.join(PUBLIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
