import base64
import cv2
import numpy as np
import socketio
import time

# Initialize Socket.IO client
sio = socketio.Client()



# Connect to the server
sio.connect('http://192.168.1.8:5000')  # Replace with your server's IP

# Event when connected to the server
@sio.event
def connect():
    print("Connected to the server.")

# Event when connection fails
@sio.event
def connect_error(data):
    print("Connection failed:", data)

# Function to send the frame to the server
def send_frame():
    cap = cv2.VideoCapture(1)  # Open the Raspberry Pi's camera
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

# Function to receive commands from the server and control the car's motors
@sio.event
def command_to_client(data):
    command = data['command']
    print(f"Received command: {command}")  # Debugging received command


# Start sending frames to the server in a separate thread
from threading import Thread
frame_thread = Thread(target=send_frame)
frame_thread.start()

# Keep the client running to receive and send data
sio.wait()
