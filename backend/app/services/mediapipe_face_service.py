import mediapipe as mp
import cv2

mp_face_detection = mp.solutions.face_detection

face_detection = mp_face_detection.FaceDetection(
	model_selection=0, 
	min_detection_confidence=0.5
)

def mediapipe_status():
    return {
        "mediapipe_loaded": face_detection is not None
    }

def detect_faces(frame):
	rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
	return face_detection.process(rgb_frame)

def has_faces(result):
	return result.detections is not None