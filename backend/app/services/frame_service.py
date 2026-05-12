import cv2
import numpy as np


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
