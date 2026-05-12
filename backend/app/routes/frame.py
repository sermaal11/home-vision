from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/frame")
async def receive_frame(frame: UploadFile = File(...)):
	return {
		"filename": frame.filename,
		"content_type": frame.content_type,		
	}
