from fastapi import APIRouter
from app.services.system_service import get_system_status

router = APIRouter()

@router.get("/health")
def health():
    return get_system_status()
