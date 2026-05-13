from fastapi import FastAPI
from app.routes.health import router as health_router
from app.routes.frame import router as frame_router
from app.routes.mediapipe_face import router as mediapipe_face_router

app = FastAPI()

app.include_router(health_router, prefix="/api")
app.include_router(frame_router, prefix="/api")
app.include_router(mediapipe_face_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Backend is running!"}
