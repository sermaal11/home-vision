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

def has_faces(result):
	return result.detections is not None

def detect_faces(frame):
	rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
	return face_detection.process(rgb_frame)

def draw_face_boxes(frame, results):
    if not results.detections:
        return frame
    height, width, _ = frame.shape
    for detection in results.detections:
        bbox = detection.location_data.relative_bounding_box
        x = int(bbox.xmin * width)
        y = int(bbox.ymin * height)
        box_width = int(bbox.width * width)
        box_height = int(bbox.height * height)
        confidence = detection.score[0]
        cv2.rectangle(
            frame,
            (x, y),
            (x + box_width, y + box_height),
            (0, 255, 0),
            2
        )
        label = f"Face {confidence:.2f}"
        cv2.putText(
            frame,
            label,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2
        )
    return frame