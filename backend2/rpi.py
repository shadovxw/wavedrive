import base64
import cv2
import socketio
import time
from flask import Flask, request
from threading import Thread

# Initialize Socket.IO client
sio = socketio.Client()

# Flask app to simulate RPi receiving commands
app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return "HELLO"


@app.route('/command', methods=['POST'])
def handle_command():
    data = request.get_json()
    command = data.get('command', '')
    print(f"[RPi-Dummy] Received command: {command}")

    # Simulated motor response
    if command == "forward":
        print("🚗 Moving forward")
    elif command == "reverse":
        print("🔙 Reversing")
    elif command == "left":
        print("↩️ Turning left")
    elif command == "right":
        print("↪️ Turning right")
    elif command == "stop":
        print("🛑 Stopping")
    else:
        print("❓ Unknown command")

    return "Command received", 200

# Function to simulate sending camera frames
def send_frame():
    cap = cv2.VideoCapture(1)  # Change to 0 if needed
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # Optional: Resize for better performance (same as Flask if needed)
        frame = cv2.resize(frame, (640, 480))

        # Encode the frame as JPEG (same as Flask)
        _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])  # 50 = compressed
        encoded_frame = base64.b64encode(buffer).decode('utf-8')

        # Send to backend via Socket.IO
        print("sending frame")
        sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded_frame}'})
        print("sending frame wgbeqthqteh")
        # Show frame locally (for debug)
        cv2.imshow("RPi Dummy Webcam", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        time.sleep(0.2)  # ~5 FPS

    cap.release()
    cv2.destroyAllWindows()



@sio.event
def connect():
    print("[RPi-Dummy] Connected to controller server.")

@sio.event
def connect_error(data):
    print("[RPi-Dummy] Connection failed:", data)

# Optional: Receive command event directly (not used here)
@sio.event
def command_to_client(data):
    print("[RPi-Dummy] Received command_to_client:", data)

# Connect to local controller backend
sio.connect('http://localhost:5000')  # LOCAL TESTING

# Start sending camera frames
frame_thread = Thread(target=send_frame)
frame_thread.start()

# Run Flask to simulate motor control API
def run_flask():
    app.run(host='0.0.0.0', port=5001, threaded=True)

flask_thread = Thread(target=run_flask)
flask_thread.start()

# Keep listening for events
sio.wait()
