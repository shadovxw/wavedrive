import React, { useState } from "react";
import "./ClientCode.css";

const ClientCodeInstructions = `# Raspberry Pi client code (sample)
import base64
import cv2
import socket
import socketio
import time
from flask import Flask, request
from threading import Thread

# Setup Flask
app = Flask(__name__)

# Setup SocketIO Client
sio = socketio.Client()
server_url = 'https://wavedrive-backend.onrender.com'  # UPDATE THIS if server is on different IP

# Get local IP dynamically
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# ========== Flask Routes ==========
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

@app.route('/me', methods=['GET'])
def me():
    return "Hello from WaveDrive client!"

# ========== Video Feed ==========
def send_frame():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Webcam not accessible")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        _, buffer = cv2.imencode('.jpg', frame)
        encoded = base64.b64encode(buffer).decode('utf-8')

        if sio.connected:
            try:
                sio.emit('rpi_feed', {'frame': f'data:image/jpeg;base64,{encoded}'})
            except Exception as e:
                print(f"[SOCKET.IO] Emit error: {e}")

        time.sleep(0.1)

# ========== SocketIO Events ==========
@sio.event
def connect():
    print("[SOCKET.IO] Connected")
    ip = get_local_ip()
    print(f"[REGISTER] Sending IP: {ip}")
    sio.emit('register_ip', {'ip': ip})

@sio.event
def disconnect():
    print("[SOCKET.IO] Disconnected")

@sio.event
def connect_error(data):
    print("[SOCKET.IO] Connection failed:", data)

@sio.event
def command_to_client(data):
    command = data['command']
    print(f"[SOCKET.IO] Command from server: {command}")
    handle_command_simulated(command)

# Local simulation only
def handle_command_simulated(command):
    print(f"[SIMULATED] Executing: {command}")

# ========== Threads ==========
def run_flask():
    app.run(host='0.0.0.0', port=5000, threaded=True)

def connect_to_server():
    while True:
        try:
            if not sio.connected:
                print(f"[CONNECT] Trying {server_url}...")
                sio.connect(server_url)
            break
        except Exception as e:
            print(f"[ERROR] Could not connect: {e}")
            time.sleep(5)

# ========== Run All ==========
flask_thread = Thread(target=run_flask)
flask_thread.start()

video_thread = Thread(target=send_frame)
video_thread.start()

connect_to_server()
sio.wait()
`;

const ClientCode = () => {
  const [copied, setCopied] = useState(false);
  

  const handleCopy = () => {
    navigator.clipboard.writeText(ClientCodeInstructions).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container">
      <div className="code-section">
        <h2>Raspberry Pi Client Code</h2>
        <button className="copy-btn" onClick={handleCopy}>📋 Copy</button>
        {copied && <p className="copied-text">Copied!</p>}
        <pre className="code-block"><code>{ClientCodeInstructions}</code></pre>
      </div>

      <div className="instruction-section">
        <h2>Install Dependencies</h2>
        <pre className="install-box">
          <code>pip install opencv-python flask request socketio</code>
        </pre>
      </div>
    </div>
  );
};

export default ClientCode;
