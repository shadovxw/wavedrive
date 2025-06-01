import cv2
import socketio
import base64

# Backend URL
BACKEND_URL = 'http://localhost:5000'

# Create a Socket.IO client
sio = socketio.Client()

# Connect to the backend
sio.connect(BACKEND_URL)

# Initialize the video capture (use 0 for the default camera or 1 for another camera)
cap = cv2.VideoCapture(1)

# Event handler to receive commands from the server
@sio.event
def connect():
    print("Connected to the server")

# Handle the command received from the server
@sio.event
def command_to_client(data):
    print(f"Received command: {data['command']}")

# Function to capture video frames and send them to the server
def capture_and_send_frames():
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # Encode the frame to JPEG and then to base64
        _, buffer = cv2.imencode('.jpg', frame)
        encoded = base64.b64encode(buffer).decode('utf-8')

        # Emit the video feed to the server
        sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded}'})

        # Check for 'q' key to exit the loop (still checks for key press while emitting frames)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture object after exiting the loop
    cap.release()

# Start the video capture and sending frames
#capture_and_send_frames()

# Process Socket.IO events (this will keep listening for events like 'command_to_client')
sio.wait()

# Disconnect from Socket.IO after processing is done
sio.disconnect()
