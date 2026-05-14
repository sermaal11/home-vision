from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from app.services.motiondetection_service import (
    decode_frame,
    encode_frame
)
from app.services.face_service import (
    detect_face_mesh,
    detect_faces,
    draw_face_boxes,
    draw_face_mesh,
    draw_eye_tracking
)

router = APIRouter()

@router.post("/mediapipe/face-box")
async def face(frame: UploadFile = File(...)):
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

@router.post("/mediapipe/face-mesh")
async def face_mesh(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image frame"
        )
    results = detect_face_mesh(decoded_frame)
    face_frame = draw_face_mesh(
        decoded_frame,
        results
    )
    encoded_frame = encode_frame(face_frame)
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )

@router.post("/mediapipe/eye-tracking")
async def eye_tracking(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image frame"
        )
    results = detect_face_mesh(decoded_frame)
    face_frame, gaze_direction = draw_eye_tracking(
        decoded_frame,
        results
    )
    encoded_frame = encode_frame(face_frame)
    return Response(
        encoded_frame,
        media_type="image/jpeg",
        headers={
            "X-Gaze-Direction": gaze_direction
        }
    )
