import cv2
import socketio
import base64

BACKEND_URL = 'http://localhost:5000'


sio = socketio.Client()
sio.connect(BACKEND_URL)

cap = cv2.VideoCapture(1)

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    _, buffer = cv2.imencode('.jpg', frame)
    encoded = base64.b64encode(buffer).decode('utf-8')
    sio.emit('rpi_feed', { 'frame': f'data:image/jpeg;base64,{encoded}' })

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
sio.disconnect()
