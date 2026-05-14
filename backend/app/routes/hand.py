from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import Response

from app.services.motiondetection_service import (
    decode_frame,
    encode_frame
)

from app.services.hand_service import (
    detect_hands,
    draw_hand_landmarks
)

router = APIRouter()

@router.post("/mediapipe/hands")
async def mediapipe_hands(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image frame"
        )
    results = detect_hands(decoded_frame)
    hand_frame = draw_hand_landmarks(
        decoded_frame,
        results
    )
    encoded_frame = encode_frame(hand_frame)
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )