from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from app.services.frame_service import decode_frame
from app.services.frame_service import to_grayscale
from app.services.frame_service import encode_frame
from app.services.frame_service import blur_frame
from app.services.frame_service import get_frame_difference
from app.services.frame_service import threshold_frame
from app.services.frame_service import find_motion_contours
from app.services.frame_service import draw_contours

router = APIRouter()

@router.post("/frame")
async def receive_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    try:
        encoded_frame = encode_frame(decoded_frame)
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    return Response(encoded_frame, media_type="image/jpeg")

@router.post("/frame/grayscale")
async def receive_grayscale_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = to_grayscale(decoded_frame)
    try:
        encoded_frame = encode_frame(gray_frame)
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    return Response(encoded_frame, media_type="image/jpeg")

@router.post("/frame/blur")
async def receive_blur_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = to_grayscale(decoded_frame)
    blurred_frame = blur_frame(gray_frame)
    try:
        encoded_frame = encode_frame(blurred_frame)
    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )

@router.post("/frame/difference")
async def receive_difference_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = to_grayscale(decoded_frame)
    blurred_frame = blur_frame(gray_frame)
    difference_frame = get_frame_difference(blurred_frame)
    try:
        encoded_frame = encode_frame(difference_frame)
    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )

@router.post("/frame/threshold")
async def receive_threshold_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = to_grayscale(decoded_frame)
    thresholded_frame = threshold_frame(gray_frame)
    try:
        encoded_frame = encode_frame(thresholded_frame)
    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )

@router.post("/frame/contours")
async def receive_contours_frame(frame: UploadFile = File(...)):
    content = await frame.read()
    decoded_frame = decode_frame(content)
    if decoded_frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")
    gray_frame = to_grayscale(decoded_frame)
    thresholded_frame = threshold_frame(gray_frame)
    contours = find_motion_contours(thresholded_frame)
    contour_frame = draw_contours(thresholded_frame, contours)
    try:
        encoded_frame = encode_frame(contour_frame)
    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error
    return Response(
        encoded_frame,
        media_type="image/jpeg"
    )
