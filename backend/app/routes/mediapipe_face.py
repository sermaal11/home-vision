from fastapi import APIRouter, File, HTTPException, UploadFile
from app.services.frame_service import decode_frame
from app.services.mediapipe_face_service import detect_faces, has_faces

router = APIRouter()

@router.post("/mediapipe/face")
async def mediapipe_face(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image frame"
        )
    result = detect_faces(decoded_frame)
    return {
        "face_detected": has_faces(result)
    }
