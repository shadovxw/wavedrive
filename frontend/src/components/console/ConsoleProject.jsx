import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './ConsoleComponent.css';

function ConsoleComponent() {
  const [streaming, setStreaming] = useState(false);
  const [command, setCommand] = useState('');
  const [rpiFrame, setRpiFrame] = useState(null);
  const [ip, setIp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://127.0.0.1:5000');

    socketRef.current.on('connect', () => {
      console.log('[Socket.IO] Connected');
    });

    socketRef.current.on('ip_registered', (data) => {
      console.log('[Server] IP Registered:', data.message);
      setRegistered(true);
      setLoading(false);
    });

    socketRef.current.on('webcam_result', (data) => {
      const img = new Image();
      img.src = data.frame;
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      setCommand(data.command);
    });

    socketRef.current.on('rpi_result', (data) => {
      setRpiFrame(data.rpi_frame);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleIpSubmit = () => {
    if (!ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      alert('Please enter a valid IP address');
      return;
    }
    setSubmitted(true);
    setLoading(true);
    socketRef.current.emit('register_ip', { ip });
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);

      const sendFrame = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoRef.current.videoWidth;
        tempCanvas.height = videoRef.current.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        tempCanvas.toBlob(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            socketRef.current.emit('frame', { frame: reader.result });
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.6);
      };

      const intervalId = setInterval(sendFrame, 200);
      videoRef.current.intervalId = intervalId;
    } catch (err) {
      console.error('Webcam access error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      clearInterval(videoRef.current.intervalId);
    }
    setStreaming(false);
  };

  if (!submitted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>Enter Raspberry Pi IP Address</h1>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="e.g. 192.168.1.5"
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '250px'
          }}
        />
        <br />
        <button onClick={handleIpSubmit} style={{ ...buttonStyle, marginTop: '20px' }}>
          Submit
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '150px' }}>
        <h2>Registering IP...</h2>
        <div className="loader" />
      </div>
    );
  }

  if (!registered) return null;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>WaveDrive | Gesture Console</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <video
          ref={videoRef}
          width="0"
          height="0"
          autoPlay
          playsInline
          style={{ display: streaming ? 'block' : 'none' }}
        />
        {streaming && (
          <>
            <canvas
              ref={canvasRef}
              width="320"
              height="500"
              style={{ width: '400px', height: '300px' }}
            />
            {rpiFrame && (
              <img
                src={rpiFrame}
                alt="RPi Feed"
                width="700"
                height="500"
                style={{ background: '#eee', borderRadius: '4px' }}
              />
            )}
          </>
        )}
      </div>
      <h3>Command: <span className="h33">{command || "Waiting..."}</span></h3>
      <div style={{ marginTop: '20px' }}>
        <button onClick={streaming ? stopWebcam : startWebcam} style={buttonStyle}>
          {streaming ? "Stop Feeds" : "Start Feeds"}
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  margin: '10px',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#007BFF',
  color: 'white'
};

export default ConsoleComponent;
