from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    return {"message": "Agentic AI Portfolio Manager API is running"}
