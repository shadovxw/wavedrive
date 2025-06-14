export const LANGUAGE_VERSIONS = {
  python: "3.10.0",
};

export const CODE_SNIPPETS = {
  python: `import base64
import cv2
import socketio
import time
from flask import Flask, request
from threading import Thread

# Initialize Socket.IO client
sio = socketio.Client()

# Flask setup
app = Flask(__name__)

# Simulated Motor Command Handling (for laptop testing)
@app.route('/command', methods=['POST'])
def handle_command():
    data = request.get_json()
    command = data.get('command', '')
    
    print(f"[FLASK] Received command: {command}")
    
    if command == "forward":
        print("[SIMULATION] Moving forward")
    elif command == "reverse":
        print("[SIMULATION] Moving reverse")
    elif command == "stop":
        print("[SIMULATION] Stopping")
    else:
        print("[SIMULATION] Unknown command")

    return "Command received", 200

# Send webcam feed to server
def send_frame():
    cap = cv2.VideoCapture(0)  # Laptop webcam is usually index 0
    if not cap.isOpened():
        print("Webcam not accessible")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')
        
        sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded_frame}'})
        time.sleep(0.1)  # Control frame rate

    cap.release()

# Socket.IO events
@sio.event
def connect():
    print("[SOCKET.IO] Connected to server")

@sio.event
def connect_error(data):
    print("[SOCKET.IO] Connection failed:", data)

@sio.event
def command_to_client(data):
    command = data['command']
    print(f"[SOCKET.IO] Received command from server: {command}")
    # Simulate motor control
    handle_command_simulated(command)

# Simulated motor control function (instead of calling Flask endpoint)
def handle_command_simulated(command):
    print(f"[SIMULATED] Executing command: {command}")

# Connect to server (adjust the IP if needed)
sio.connect('http://192.168.1.8:5000')

# Start video streaming thread
frame_thread = Thread(target=send_frame)
frame_thread.start()

# Run Flask server in background
def run_flask():
    app.run(host='0.0.0.0', port=5002, threaded=True)

flask_thread = Thread(target=run_flask)
flask_thread.start()

# Keep running
sio.wait()
`
};
