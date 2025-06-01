import base64
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from datetime import datetime
from flask import Flask, request
from flask_socketio import SocketIO, emit
from pymongo import MongoClient

# Flask + SocketIO Setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client.wavedrive
gesture_logs = db.gesture_logs

# Load ML Model
model = tf.keras.models.load_model("backend/gesture_model.h5")
gesture_map = {
    0: 'forward',
    1: 'left',
    2: 'right',
    3: 'backward',
    4: 'stop'
}

# MediaPipe Setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)


# Predict gesture using ML model
def predict_gesture(landmarks_3d):
    input_vector = np.array(landmarks_3d).flatten().reshape(1, -1)
    prediction = model.predict(input_vector)
    predicted_class = np.argmax(prediction)
    return gesture_map.get(predicted_class, 'stop')

# Log gesture to MongoDB
def log_gesture(session_id, gesture, command):
    gesture_logs.insert_one({
        "session_id": session_id,
        "gesture": gesture,
        "command": command,
        "timestamp": datetime.utcnow()
    })

# WebSocket frame receiver
@socketio.on('frame')
def handle_frame(data):
    session_id = data.get('session_id')
    blob = data.get('frame')

    # If data is base64 string, decode it
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
        command = predict_gesture(landmarks)
        if session_id:
            log_gesture(session_id, 'hand', command)

    _, buffer = cv2.imencode('.jpg', frame)
    encoded_frame = base64.b64encode(buffer).decode('utf-8')

    emit('result', {
        'command': command,
        'frame': f'data:image/jpeg;base64,{encoded_frame}'
    })

@app.route('/')
def index():
    return "WaveDrive Real-Time Gesture Server Running"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
