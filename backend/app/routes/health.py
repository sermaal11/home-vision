from fastapi import APIRouter
from app.services.system_service import get_system_status
from app.services.frame_service import frame_status
from app.services.mediapipe_face_service import mediapipe_status

router = APIRouter()

@router.get("/health")
def health():
    return get_system_status()

@router.get("/health/mediapipe")
def mediapipe_health():
    return mediapipe_status()

@router.get("/health/frame")
def frame_health():
    return frame_status()
