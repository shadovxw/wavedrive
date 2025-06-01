import socketio
import base64
import cv2
import threading

# Backend URL
BACKEND_URL = 'http://192.168.1.8:5000/'

# Create the Socket.IO clien
sio = socketio.Client()
sio.connect(BACKEND_URL)
# Function to handle server commands
@sio.event
def connect():
    print("Connected to the server")

@sio.event
def disconnect():
    print("Disconnected from the server")

# Function to handle commands from the server
@sio.event
def command_to_client(data):
    print(f"Received command: {data['command']}")
    # You can add logic to handle different commands here

# Connect to the server


# Initialize video capture (use 0 for the default camera, 1 for another connected camera)
cap = cv2.VideoCapture(1)
# Function to capture video frames and send them via Socket.IO
def capture_and_send():
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            continue

        # Encode the frame to JPEG and then to base64
        _, buffer = cv2.imencode('.jpg', frame)
        encoded = base64.b64encode(buffer).decode('utf-8')

        # Emit the video feed to the server
        sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded}'})

        # Optionally, display the frame on the client side
        #cv2.imshow("Raspberry Pi Video Feed", frame)

        # Check for 'q' key to exit the loop
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Start the capture in a separate thread to avoid blocking the main thread
capture_thread = threading.Thread(target=capture_and_send)
capture_thread.start()

# Keep the connection alive
try:
    while True:
        pass
except KeyboardInterrupt:
    # Gracefully handle termination
    print("Terminating...")
    capture_thread.join()
    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()
