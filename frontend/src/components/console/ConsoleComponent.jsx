import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './ConsoleComponent.css'

function ConsoleComponent() {
  const [streaming, setStreaming] = useState(false);
  const [command, setCommand] = useState('');
  const [rpiFrame, setRpiFrame] = useState(null); // Store the RPi feed frame here
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://127.0.0.1:5000');

    // Listen for webcam frames (processed frames)
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

    // Listen for Raspberry Pi feed
    socketRef.current.on('rpi_result', (data) => {
      setRpiFrame(data.rpi_frame);  // Store the RPi frame here
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

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
            socketRef.current.emit('frame', {
              frame: reader.result,
              session_id: 'test-session'
            });
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

  return (
    
    <div style={{ textAlign: 'center', padding: '20px' }}>
          <br></br>
          <br></br>
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
            {/* Display RPi feed here */}
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
      <h3>Command: <span className="h33">{command || "Waiting..."}</span> </h3>
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
