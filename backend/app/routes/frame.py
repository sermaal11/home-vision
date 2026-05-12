from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
import cv2
import numpy as np

router = APIRouter()

@router.post("/frame")
async def receive_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    np_array = np.frombuffer(content, np.uint8)
    decoded_frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = cv2.cvtColor(decoded_frame, cv2.COLOR_BGR2GRAY)
    _, buffer = cv2.imencode('.jpg', gray_frame)
    return Response(buffer.tobytes(), media_type="image/jpeg")
