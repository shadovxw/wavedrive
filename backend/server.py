import base64
import cv2
import numpy as np
import mediapipe as mp
import requests
from datetime import datetime
from flask import Flask, request
from flask_socketio import SocketIO, emit

# Flask + SocketIO Setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

# MediaPipe Setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

RPI_IP = "http://192.168.179.160:5000"  


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
            return 'backward'
        elif (landmarks[4][0] < landmarks[8][0]):
            return 'right'
        elif (landmarks[4][0] > landmarks[8][0]):
            return 'left'
        else:
            return 'stop'
    except Exception as e:
        print(f"Error in gesture detection: {e}")
        return 'stop'


def send_command_to_rpi(command):
    try:
        url = f"{RPI_IP}/command" 
        payload = {'command': command}  
        headers = {'Content-Type': 'application/json'}

        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print(f"Successfully sent command: {command}")
        else:
            print(f"Failed to send command: {command}, Status Code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending command to RPi: {e}")
    except Exception as e:
        print(f"Unexpected error sending command: {e}")


@socketio.on('frame')
def handle_frame(data):
    try:
        session_id = data.get('session_id')
        blob = data.get('frame')

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

        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')

        emit('webcam_result', {
            'command': command,
            'frame': f'data:image/jpeg;base64,{encoded_frame}'
        })

        print(f"Emitting command to client: {command}")

        send_command_to_rpi(command)

    except Exception as e:
        print(f"Error processing frame: {e}")


@socketio.on('rpi_feed')
def handle_rpi_feed(data):
    try:
        if 'frame' not in data:
            print("Received invalid frame data")
            return

        emit('rpi_result', {  
            'rpi_frame': data['frame']
        }, broadcast=True)
    except Exception as e:
        print(f"Error handling RPi feed: {e}")

@app.route('/')
def index():
    return "WaveDrive Real-Time Gesture Server Running"

if __name__ == '__main__':
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"Error running Flask app: {e}")
