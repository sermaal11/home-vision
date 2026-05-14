import mediapipe as mp
import cv2

mp_face_detection = mp.solutions.face_detection

face_detection = mp_face_detection.FaceDetection(
	model_selection=0, 
	min_detection_confidence=0.5
)

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

LEFT_IRIS = [468]
RIGHT_IRIS = [473]

def face_status():
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

def detect_face_mesh(frame):
    rgb_frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
    return face_mesh.process(rgb_frame)

def draw_face_mesh(frame, results):
    if not results.multi_face_landmarks:
        return frame
    for face_landmarks in results.multi_face_landmarks:
        mp_drawing.draw_landmarks(
            image=frame,
            landmark_list=face_landmarks,
            connections=mp.solutions.face_mesh.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles
                .get_default_face_mesh_tesselation_style()
        )
    return frame

def draw_eye_tracking(frame, results):
    if not results.multi_face_landmarks:
        return frame
    height, width, _ = frame.shape
    for face_landmarks in results.multi_face_landmarks:
        for iris_index in LEFT_IRIS + RIGHT_IRIS:
            landmark = face_landmarks.landmark[iris_index]
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            cv2.circle(
                frame,
                (x, y),
                5,
                (0, 255, 255),
                -1
            )
    return frame
