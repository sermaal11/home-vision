from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from app.services.frame_service import (
    decode_frame,
    encode_frame
)
from app.services.mediapipe_face_service import (
    detect_faces,
    draw_face_boxes
)

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
    results = detect_faces(decoded_frame)
    face_frame = draw_face_boxes(
        decoded_frame,
        results
    )
    encoded_frame = encode_frame(face_frame)
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )
