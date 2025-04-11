import cv2
import base64
import socketio

# Initialize SocketIO client
sio = socketio.Client()

# Connect to the backend WebSocket server (make sure the backend is running and accessible)
BACKEND_URL = 'https://wavedrive-3.onrender.com'  # Replace with your backend URL
sio.connect(BACKEND_URL)

# Open the laptop webcam (device 0)
cap = cv2.VideoCapture(0)

def send_frame():
    # Capture frame from the webcam
    ret, frame = cap.read()

    if not ret:
        print("Failed to grab frame")
        return

    # Convert the frame to JPEG format
    _, buffer = cv2.imencode('.jpg', frame)
    # Convert the frame to base64
    frame_base64 = base64.b64encode(buffer).decode('utf-8')

    # Send the frame to the backend
    sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{frame_base64}'})

# Set a timer to send frames every 200ms
while True:
    send_frame()

cap.release()  # Release the webcam