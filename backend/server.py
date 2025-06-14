import base64
import cv2
import numpy as np
import requests
from flask import Flask, request
from flask_socketio import SocketIO, emit
import os
import mediapipe as mp


# Setup Flask and Socket.IO
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

# MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

# Globals
registered_ip = None
transmission_active = False

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
        print(f"Gesture detection error: {e}")
        return 'stop'

@socketio.on('register_ip')
def register_ip(data):
    global registered_ip
    ip = data.get('ip')
    if ip:
        registered_ip = ip
        print(f"[REGISTER] Registered IP: {registered_ip}")
        emit('ip_registered', {'message': f'IP {ip} registered successfully.'})
    else:
        print("[REGISTER] No IP provided.")

@socketio.on('start_transmission')
def start_transmission():
    global transmission_active
    transmission_active = True
    print(f"[TRANSMISSION] Started by {registered_ip}")
    emit('transmission_status', {'status': 'started'})

@socketio.on('stop_transmission')
def stop_transmission():
    global transmission_active
    transmission_active = False
    print(f"[TRANSMISSION] Stopped by {registered_ip}")
    emit('transmission_status', {'status': 'stopped'})

@socketio.on('rpi_feed')
def handle_rpi_feed(data):
    client_ip = request.remote_addr
    if client_ip == registered_ip and transmission_active:
        if 'frame' in data:
            emit('rpi_result', {
                'rpi_frame': data['frame'],
                'source_ip': client_ip
            }, broadcast=True)
    else:
        print(f"[BLOCKED RPI_FEED] From: {client_ip} | Allowed: {registered_ip} | Active: {transmission_active}")

@socketio.on('frame')
def handle_frame(data):
    try:
        blob = data.get('frame')
        if isinstance(blob, str):
            blob = base64.b64decode(blob.split(',')[1])

        np_data = np.frombuffer(blob, np.uint8)
        frame = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        command = 'stop'  # Default command

        if results.multi_hand_landmarks:
            print("[Debug] Hand landmarks detected")
            landmarks = [(lm.x, lm.y, lm.z) for lm in results.multi_hand_landmarks[0].landmark]
            mp_drawing.draw_landmarks(frame, results.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)
            command = gesture_controls(landmarks)
        else:
            print("[Debug] No hands detected")

        # Send command to Raspberry Pi if IP is registered
        if registered_ip:
            try:
                response = requests.post(
                    f"http://{registered_ip}:5000/command",
                    json={'command': command},
                    headers={'Content-Type': 'application/json'}
                )
                print(f"[{registered_ip}] Sent command: {command}, Status: {response.status_code}")
            except Exception as e:
                print(f"Failed to send command: {e}")
        else:
            print("[Warning] No registered IP to send command")

        # Encode and emit the frame regardless of detection
        _, buffer = cv2.imencode('.jpg', frame)
        encoded = base64.b64encode(buffer).decode('utf-8')
        print(f"[Emit] Sending command: {command}, Frame size: {len(encoded)}")
        emit('webcam_result', {'command': command, 'frame': f'data:image/jpeg;base64,{encoded}'})
    except Exception as e:
        print(f"[Error] Frame handling error: {e}")


    client_ip = request.remote_addr
    if client_ip != registered_ip:
        print(f"[BLOCKED FRAME] Unauthorized IP: {client_ip}")
        return
    if not transmission_active:
        print(f"[BLOCKED FRAME] Transmission inactive")
        return

    try:
        blob = data.get('frame')
        if isinstance(blob, str):
            blob = base64.b64decode(blob.split(',')[1])

        np_data = np.frombuffer(blob, np.uint8)
        frame = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        command = 'stop'
        if results.multi_hand_landmarks:
            landmarks = [(lm.x, lm.y, lm.z) for lm in results.multi_hand_landmarks[0].landmark]
            mp_drawing.draw_landmarks(frame, results.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)
            command = gesture_controls(landmarks)

        if registered_ip:
            try:
                response = requests.post(
                    f"http://{registered_ip}:5000/command",
                    json={'command': command},
                    headers={'Content-Type': 'application/json'}
                )
                print(f"[COMMAND] Sent: {command} to {registered_ip} ({response.status_code})")
            except Exception as e:
                print(f"[ERROR] Failed to send command: {e}")

        _, buffer = cv2.imencode('.jpg', frame)
        encoded = base64.b64encode(buffer).decode('utf-8')
        print(f"[Emit] Sending command: {command}, Frame size: {len(encoded)}")
        emit('webcam_result', {'command': command, 'frame': f'data:image/jpeg;base64,{encoded}'})
    except Exception as e:
        print(f"[ERROR] Frame handling: {e}")

@app.route('/')
def index():
    return "WaveDrive Server Running"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port)
