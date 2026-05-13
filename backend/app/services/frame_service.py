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

def find_motion_contours(frame):

    contours, _ = cv2.findContours(
        frame,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )
    return contours

def draw_contours(frame, contours):

    contour_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_GRAY2BGR
    )
    cv2.drawContours(
        contour_frame,
        contours,
        -1,
        (0, 255, 0),
        2
    )
    return contour_frame

def draw_motion_boxes(frame, contours):

    if len(frame.shape) == 2:
        motion_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_GRAY2BGR
        )
    else:
        motion_frame = frame.copy()
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 500:
            continue
        x, y, width, height = cv2.boundingRect(contour)
        cv2.rectangle(
            motion_frame,
            (x, y),
            (x + width, y + height),
            (0, 0, 255),
            2
        )
    return motion_frame

def draw_motion_overlay(frame, contours):

    overlay_frame = frame.copy()
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 500:
            continue
        x, y, width, height = cv2.boundingRect(contour)
        cv2.rectangle(
            overlay_frame,
            (x, y),
            (x + width, y + height),
            (0, 0, 255),
            2
        )
    return overlay_frame
