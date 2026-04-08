from fastapi import FastAPI

from app.api.analyze import router as analyze_router
from app.api.portfolio import router as portfolio_router
from app.api.routes import router as root_router
from app.core.database import create_tables

app = FastAPI(title="Agentic AI Portfolio Manager API")


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize database tables on application startup."""
    create_tables()


app.include_router(root_router)
app.include_router(analyze_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")
