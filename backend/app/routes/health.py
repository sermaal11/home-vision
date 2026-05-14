from fastapi import APIRouter
from app.services.system_service import get_system_status
from app.services.motiondetection_service import motion_detection_status
from app.services.face_service import face_status

router = APIRouter()

@router.get("/health")
def health():
    return get_system_status()

@router.get("/health/mediapipe")
def mediapipe_health():
    return face_status()

@router.get("/health/frame")
def frame_health():
    return motion_detection_status()
