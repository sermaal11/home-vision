import cv2
import numpy as np

previous_frame = None

def decode_frame(content: bytes):
    np_array = np.frombuffer(content, np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)


def to_grayscale(frame):
    return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


def encode_frame(frame):
    success, buffer = cv2.imencode('.jpg', frame)
    if not success:
        raise ValueError("Could not encode frame as JPEG")
    return buffer.tobytes()


def blur_frame(frame):
    return cv2.GaussianBlur(frame, (21, 21), 0)


def get_frame_difference(frame):
    global previous_frame
    if previous_frame is None:
        previous_frame = frame
        return frame
    difference = cv2.absdiff(previous_frame, frame)
    previous_frame = frame
    return difference


def threshold_frame(frame):
    _, threshold = cv2.threshold(
        frame,
        25,
        255,
        cv2.THRESH_BINARY
    )
    return threshold
