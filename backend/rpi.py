import base64
import cv2
import socketio
import time
from flask import Flask, request
from threading import Thread

# Initialize Socket.IO client
sio = socketio.Client()

# Flask setup for handling motor commands
app = Flask(__name__)

# Motor control function based on received command
@app.route('/command', methods=['POST'])
def handle_command():
    data = request.get_json()
    command = data.get('command', '')
    
    print(f"Received command: {command}")
    
    # Handle motor control logic here (e.g., forward, reverse, stop)
    if command == "forward":
        print("Move forward")
        # Add motor control code to move forward
    elif command == "reverse":
        print("Move reverse")
        # Add motor control code to move reverse
    elif command == "stop":
        print("Stop motors")
        # Add motor control code to stop
    else:
        print("Unknown command")

    return "Command received", 200


# Function to send the frame to the server
def send_frame():
    cap = cv2.VideoCapture(1)  # Open the Raspberry Pi's camera (you can change the camera index)
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        # Encode the frame to base64
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')
        
        # Send the frame to the server
        sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded_frame}'})
        
        # Wait a bit to simulate continuous feed
        time.sleep(0.1)
    
    cap.release()

# Event when connected to the server
@sio.event
def connect():
    print("Connected to the server.")

# Event when connection fails
@sio.event
def connect_error(data):
    print("Connection failed:", data)

# Function to receive commands from the server and control the car's motors
@sio.event
def command_to_client(data):
    command = data['command']
    print(f"Received command: {command}")  # Debugging received command
    # Call the motor control function directly if necessary
    # For example:
    # handle_command(command)

# Connect to the server
sio.connect('http://192.168.1.8:5000')  # Replace with your server's IP

# Start sending frames to the server in a separate thread
frame_thread = Thread(target=send_frame)
frame_thread.start()

# Run Flask server in a separate thread
def run_flask():
    app.run(host='0.0.0.0', port=5001, threaded=True)

flask_thread = Thread(target=run_flask)
flask_thread.start()

# Keep the client running to receive and send data
sio.wait()
