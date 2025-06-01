import socketio

# Backend URL
BACKEND_URL = 'http://localhost:5000/'

# Create a Socket.IO client
sio = socketio.Client()

# Connect to the backend
sio.connect(BACKEND_URL)

# Event handler to receive commands from the server
@sio.event
def connect():
    print("Connected to the server")

# Handle the command received from the server
@sio.event
def command_to_client(data):
    print(f"Received command: {data['command']}")

# Keep the client running to listen for events
sio.wait()

# Disconnect from the server when done (this line will never be reached as the client is in `wait` mode)
sio.disconnect()
