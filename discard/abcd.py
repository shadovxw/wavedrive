from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return "Server is running"

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    # Send a command to the client
    emit('command_to_client', {'command': 'forward'})

@socketio.on('ping')
def handle_ping(data):
    print(f"Received ping: {data['message']}")
    # Respond with a 'pong' event
    emit('pong', {'message': 'Hello Client!'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
