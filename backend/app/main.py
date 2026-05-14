from fastapi import FastAPI
from app.routes.health import router as health_router
from app.routes.motiondetection import router as motion_detection_router
from app.routes.face import router as face_router

app = FastAPI()

app.include_router(health_router, prefix="/api")
app.include_router(motion_detection_router, prefix="/api")
app.include_router(face_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Backend is running!"}
