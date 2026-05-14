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

FINGER_TIPS = [8, 12, 16, 20]
FINGER_PIPS = [6, 10, 14, 18]
THUMB_TIP = 4
THUMB_IP = 3

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

def count_fingers(hand_landmarks, handedness):
    fingers = 0
    hand_label = handedness.classification[0].label if handedness else "Unknown"
    thumb_tip_x = hand_landmarks.landmark[THUMB_TIP].x
    thumb_ip_x = hand_landmarks.landmark[THUMB_IP].x
    if (
        (hand_label == "Right" and thumb_tip_x < thumb_ip_x)
        or (hand_label == "Left" and thumb_tip_x > thumb_ip_x)
    ):
        fingers += 1
    for tip, pip in zip(FINGER_TIPS, FINGER_PIPS):
        tip_y = hand_landmarks.landmark[tip].y
        pip_y = hand_landmarks.landmark[pip].y
        if tip_y < pip_y:
            fingers += 1
    return fingers

def draw_finger_counter(frame, results):
    if not results.multi_hand_landmarks:
        return frame, 0
    height, width, _ = frame.shape
    total_finger_count = 0
    handedness_items = results.multi_handedness or []
    for index, hand_landmarks in enumerate(results.multi_hand_landmarks):
        handedness = handedness_items[index] if index < len(handedness_items) else None
        finger_count = count_fingers(
            hand_landmarks,
            handedness
        )
        total_finger_count += finger_count
        mp_drawing.draw_landmarks(
            image=frame,
            landmark_list=hand_landmarks,
            connections=mp_hands.HAND_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles
                .get_default_hand_landmarks_style(),
            connection_drawing_spec=mp_drawing_styles
                .get_default_hand_connections_style()
        )
        wrist = hand_landmarks.landmark[0]
        wrist_x = int(wrist.x * width)
        wrist_y = int(wrist.y * height)
        cv2.putText(
            frame,
            f"Fingers: {finger_count}",
            (wrist_x, wrist_y - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )
    return frame, total_finger_count
