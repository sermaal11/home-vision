import mediapipe as mp
import cv2
import numpy as np

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

HEAD_POSE_LANDMARKS = (1, 152, 33, 263, 61, 291)
HEAD_POSE_MODEL_POINTS = np.array(
    [
        (0.0, 0.0, 0.0),
        (0.0, -63.6, -12.5),
        (-43.3, 32.7, -26.0),
        (43.3, 32.7, -26.0),
        (-28.9, -28.9, -24.1),
        (28.9, -28.9, -24.1),
    ],
    dtype=np.float64
)
HEAD_POSE_AXIS_POINTS = np.array(
    [
        (55.0, 0.0, 0.0),
        (0.0, 55.0, 0.0),
        (0.0, 0.0, 75.0),
    ],
    dtype=np.float64
)
HEAD_POSE_AXIS_ALPHA = 0.55

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

def draw_head_pose(frame, results):
    if not results.multi_face_landmarks:
        return frame, "Unknown"
    height, width, _ = frame.shape
    pose_label = "Unknown"
    for face_landmarks in results.multi_face_landmarks:
        image_points = get_head_pose_image_points(
            face_landmarks,
            width,
            height
        )
        camera_matrix = get_camera_matrix(width, height)
        success, rotation_vector, translation_vector = cv2.solvePnP(
            HEAD_POSE_MODEL_POINTS,
            image_points,
            camera_matrix,
            np.zeros((4, 1), dtype=np.float64),
            flags=cv2.SOLVEPNP_ITERATIVE
        )
        if not success:
            continue
        axis_points, _ = cv2.projectPoints(
            HEAD_POSE_AXIS_POINTS,
            rotation_vector,
            translation_vector,
            camera_matrix,
            np.zeros((4, 1), dtype=np.float64)
        )
        nose_x, nose_y = image_points[0].astype(int)
        axis_points = axis_points.reshape(-1, 2).astype(int)
        direction_x, direction_y = axis_points[2]
        pose_label = get_head_pose_label(
            direction_x - nose_x,
            direction_y - nose_y,
            width,
            height
        )
        cv2.circle(
            frame,
            (nose_x, nose_y),
            6,
            (0, 0, 255),
            -1
        )
        draw_head_pose_axes(
            frame,
            (nose_x, nose_y),
            axis_points
        )
    return frame, pose_label

def draw_head_pose_axes(frame, origin, axis_points):
    overlay = frame.copy()
    axis_styles = [
        (axis_points[0], (80, 80, 255)),
        (axis_points[1], (80, 255, 80)),
        (axis_points[2], (255, 160, 80)),
    ]
    for axis_point, color in axis_styles:
        cv2.line(
            overlay,
            origin,
            tuple(axis_point),
            color,
            2,
            cv2.LINE_AA
        )
        cv2.circle(
            overlay,
            tuple(axis_point),
            3,
            color,
            -1,
            cv2.LINE_AA
        )
    cv2.addWeighted(
        overlay,
        HEAD_POSE_AXIS_ALPHA,
        frame,
        1 - HEAD_POSE_AXIS_ALPHA,
        0,
        frame
    )

def get_head_pose_image_points(face_landmarks, width, height):
    return np.array(
        [
            (
                face_landmarks.landmark[index].x * width,
                face_landmarks.landmark[index].y * height
            )
            for index in HEAD_POSE_LANDMARKS
        ],
        dtype=np.float64
    )

def get_camera_matrix(width, height):
    focal_length = width
    return np.array(
        [
            [focal_length, 0, width / 2],
            [0, focal_length, height / 2],
            [0, 0, 1],
        ],
        dtype=np.float64
    )

def get_head_pose_label(horizontal_delta, vertical_delta, width, height):
    horizontal_offset = horizontal_delta / width
    vertical_offset = vertical_delta / height
    horizontal_label = "Center"
    vertical_label = ""
    if horizontal_offset < -0.06:
        horizontal_label = "Left"
    elif horizontal_offset > 0.06:
        horizontal_label = "Right"
    if vertical_offset < -0.06:
        vertical_label = " Up"
    elif vertical_offset > 0.06:
        vertical_label = " Down"
    return f"{horizontal_label}{vertical_label}"
