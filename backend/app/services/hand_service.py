import mediapipe as mp
import cv2

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

def detect_hands(frame):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return hands.process(rgb_frame)

def draw_hand_landmarks(frame, results):
    if not results.multi_hand_landmarks:
        return frame
    for hand_landmarks in results.multi_hand_landmarks:
        mp_drawing.draw_landmarks(
            image=frame,
            landmark_list=hand_landmarks,
            connections=mp_hands.HAND_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles
                .get_default_hand_landmarks_style(),
            connection_drawing_spec=mp_drawing_styles
                .get_default_hand_connections_style()
        )
    return frame
