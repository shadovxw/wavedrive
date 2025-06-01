import base64
import cv2
import numpy as np
import mediapipe as mp
from datetime import datetime
from flask import Flask, request
from flask_socketio import SocketIO, emit
import RPi.GPIO as GPIO
import time

# Flask + SocketIO Setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

# MediaPipe Setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

# GPIO Setup for motor control (example pins, adjust to your setup)
GPIO.setmode(GPIO.BCM)
motor1_pin1 = 17
motor1_pin2 = 27
motor2_pin1 = 22
motor2_pin2 = 23
GPIO.setup(motor1_pin1, GPIO.OUT)
GPIO.setup(motor1_pin2, GPIO.OUT)
GPIO.setup(motor2_pin1, GPIO.OUT)
GPIO.setup(motor2_pin2, GPIO.OUT)

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

# WebSocket: Handle webcam frames (used for gesture detection)
@socketio.on('frame')
def handle_frame(data):
    session_id = data.get('session_id')
    blob = data.get('frame')

    # Decode base64 image
    if isinstance(blob, str):
        blob = base64.b64decode(blob.split(',')[1])

    np_data = np.frombuffer(blob, np.uint8)
    frame = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the frame for hand landmarks and gestures
    results = hands.process(rgb_frame)
    command = 'stop'

    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        landmarks = [(lm.x, lm.y, lm.z) for lm in hand_landmarks.landmark]
        command = gesture_controls(landmarks)

    # Encode and send result back to client
    _, buffer = cv2.imencode('.jpg', frame)
    encoded_frame = base64.b64encode(buffer).decode('utf-8')

    # Emit both the command and frame back to the client
    emit('webcam_result', {
        'command': command,
        'frame': f'data:image/jpeg;base64,{encoded_frame}'
    })

    # Send the command to the client as well for feedback
    emit('command_to_client', {'command': command})  # Sending command to client for feedback

# WebSocket: Handle Raspberry Pi camera feed (just live feed)
@socketio.on('rpi_feed')
def handle_rpi_feed(data):
    # Capture a frame from the Raspberry Pi's camera
    cap = cv2.VideoCapture(0)  # Use Raspberry Pi camera
    ret, frame = cap.read()
    if ret:
        # Encode the frame to base64
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')
        emit('rpi_result', {'rpi_frame': f'data:image/jpeg;base64,{encoded_frame}'})
    cap.release()

# WebSocket: Handle commands from the client (e.g., move forward)
@socketio.on('send_command')
def send_command(data):
    command = data.get('command', 'stop')  # Default to 'stop' if no command is passed
    print(f"Sending command: {command}")

    # Motor control logic based on command
    if command == 'forward':
        GPIO.output(motor1_pin1, GPIO.HIGH)
        GPIO.output(motor1_pin2, GPIO.LOW)
        GPIO.output(motor2_pin1, GPIO.HIGH)
        GPIO.output(motor2_pin2, GPIO.LOW)
    elif command == 'backward':
        GPIO.output(motor1_pin1, GPIO.LOW)
        GPIO.output(motor1_pin2, GPIO.HIGH)
        GPIO.output(motor2_pin1, GPIO.LOW)
        GPIO.output(motor2_pin2, GPIO.HIGH)
    elif command == 'left':
        GPIO.output(motor1_pin1, GPIO.HIGH)
        GPIO.output(motor1_pin2, GPIO.LOW)
        GPIO.output(motor2_pin1, GPIO.LOW)
        GPIO.output(motor2_pin2, GPIO.HIGH)
    elif command == 'right':
        GPIO.output(motor1_pin1, GPIO.LOW)
        GPIO.output(motor1_pin2, GPIO.HIGH)
        GPIO.output(motor2_pin1, GPIO.HIGH)
        GPIO.output(motor2_pin2, GPIO.LOW)
    elif command == 'stop':
        GPIO.output(motor1_pin1, GPIO.LOW)
        GPIO.output(motor1_pin2, GPIO.LOW)
        GPIO.output(motor2_pin1, GPIO.LOW)
        GPIO.output(motor2_pin2, GPIO.LOW)

    # Emit the command to the client
    emit('command_to_client', {'command': command})

@app.route('/')
def index():
    return "WaveDrive Real-Time Gesture Server Running"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
