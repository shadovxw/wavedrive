import base64
import cv2
import numpy as np
import mediapipe as mp
from datetime import datetime
from flask import Flask, request
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
# from dotenv import load_dotenv
# import os

# # Load environment variables from .env file
# load_dotenv()

# # Access environment variables
# secret_key = os.getenv('SECRET_KEY')
# database_url = os.getenv('DATABASE_URL')

# Flask + SocketIO Setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client.wavedrive
gesture_logs = db.gesture_logs

# MediaPipe Setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

# Gesture Mapping Logic
def gesture_controls(landmarks):
    if (landmarks[2][1] > landmarks[4][1] and
        landmarks[7][1] > landmarks[8][1] and
        landmarks[11][1] > landmarks[12][1] and
        landmarks[15][1] > landmarks[16][1] and
        landmarks[19][1] > landmarks[20][1]):
        return 'forward'
    elif (landmarks[0][1] < landmarks[5][1] and
          landmarks[0][1] < landmarks[9][1] and
          landmarks[0][1] < landmarks[13][1] and
          landmarks[0][1] < landmarks[17][1]):
        return 'backward'
    elif (landmarks[4][0] < landmarks[8][0]):
        return 'right'
    elif (landmarks[4][0] > landmarks[8][0]):
        return 'left'
    else:
        return 'stop'

# Log gesture to MongoDB
def log_gesture(session_id, gesture, command):
    gesture_logs.insert_one({
        "session_id": session_id,
        "gesture": gesture,
        "command": command,
        "timestamp": datetime.now()
    })

# WebSocket: Handle webcam frames (used for gesture detection)
@socketio.on('frame')
def handle_frame(data):
    session_id = data.get('session_id')
    blob = data.get('frame')

    # Decode base64
    if isinstance(blob, str):
        blob = base64.b64decode(blob.split(',')[1])

    np_data = np.frombuffer(blob, np.uint8)
    frame = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = hands.process(rgb_frame)
    command = 'stop'

    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        landmarks = [(lm.x, lm.y, lm.z) for lm in hand_landmarks.landmark]
        command = gesture_controls(landmarks)
        if session_id:
            log_gesture(session_id, 'hand', command)

    # Encode and send result back to client
    _, buffer = cv2.imencode('.jpg', frame)
    encoded_frame = base64.b64encode(buffer).decode('utf-8')

    emit('webcam_result', {  # 👈 changed event name
        'command': command,
        'frame': f'data:image/jpeg;base64,{encoded_frame}'
    })

# WebSocket: Handle Raspberry Pi camera feed (just live feed)
@socketio.on('rpi_feed')
def handle_rpi_feed(data):
    # No gesture processing, just send the frame back
    emit('rpi_result', {  # 👈 different event name
        'rpi_frame': data['frame']
    }, broadcast=True)


@app.route('/')
def index():
    return "WaveDrive Real-Time Gesture Server Running"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

