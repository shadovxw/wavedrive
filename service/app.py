import eventlet
eventlet.monkey_patch()

import base64
import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

# Flask Setup
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5000",
    "https://wavedrive-backend.onrender.com"
])

# SocketIO Setup
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins=[
    "http://localhost:5000",
    "https://wavedrive-backend.onrender.com"
])

# MediaPipe Setup (lazy init will be better for large models, but ok here)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

# Gesture Recognition Logic
def gesture_controls(landmarks):
    try:
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
            return 'reverse'
        elif (landmarks[4][0] < landmarks[8][0]):
            return 'right'
        elif (landmarks[4][0] > landmarks[8][0]):
            return 'left'
        else:
            return 'stop'
    except Exception as e:
        print(f"[GESTURE ERROR] {e}")
        return 'stop'

# POST Route: Called only when frame is sent
@app.route('/process', methods=['POST'])
def process_frame():
    try:
        data = request.get_json()
        if not data or 'frame' not in data:
            return jsonify({'error': 'No frame provided'}), 400

        print("[INFO] Frame received")
        frame_data = data['frame']
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]  # Remove base64 header

        # Decode base64 to image
        img_bytes = base64.b64decode(frame_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Frame decode returned None")

        # Process hand landmarks
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        command = 'stop'
        if results.multi_hand_landmarks:
            landmarks = [(lm.x, lm.y, lm.z) for lm in results.multi_hand_landmarks[0].landmark]
            mp_drawing.draw_landmarks(frame, results.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)
            command = gesture_controls(landmarks)
        else:
            print("[INFO] No hands detected")

        # Encode processed frame back to base64
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'command': command,
            'frame': f'data:image/jpeg;base64,{encoded_frame}'
        })

    except Exception as e:
        print(f"[PROCESS ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return "Gesture Processor Microservice Running"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=6000)
