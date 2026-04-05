from fastapi import FastAPI

from app.api.analyze import router as analyze_router
from app.api.routes import router as root_router

app = FastAPI(title="Agentic AI Portfolio Manager API")

app.include_router(root_router)
app.include_router(analyze_router, prefix="/api")
