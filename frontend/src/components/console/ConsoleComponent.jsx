import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './ConsoleComponent.css';

function ConsoleComponent() {
  const [ip, setIp] = useState('');
  const [registered, setRegistered] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [command, setCommand] = useState('');
  const [rpiFrame, setRpiFrame] = useState(null);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const currentCommandRef = useRef('');

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected:', socketRef.current.id);
    });

    socketRef.current.on('ip_registered', (data) => {
      setRegistered(true);
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

      if (data.command !== currentCommandRef.current) {
        setCommand(data.command);
        currentCommandRef.current = data.command;
      }
    });

    socketRef.current.on('rpi_result', (data) => {
      setRpiFrame(data.rpi_frame);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const registerIP = () => {
    if (ip.trim()) {
      socketRef.current.emit('register_ip', { ip: ip.trim() });
    }
  };

const startWebcam = async () => {
  try {
    console.log("something4");

    // Lower resolution and frame rate for better performance
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 10 } // lower frame rate for smoother backend decoding
      }
    });

    videoRef.current.srcObject = stream;
    setStreaming(true);
    socketRef.current.emit('start_transmission');
    console.log("something3");

    const sendFrame = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;
      console.log("something2");

      // Create canvas at video resolution
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      console.log("something1");

      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);

      // Encode as compressed JPEG with 0.7 quality
      tempCanvas.toBlob(
        (blob) => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onloadend = () => {
            // Send base64 JPEG frame to backend
            socketRef.current.emit('frame', { frame: reader.result });
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.7 // compression quality (0 = worst, 1 = best)
      );
    };

    // Send frame every 200ms (5 FPS) — tweak as needed
    videoRef.current.intervalId = setInterval(sendFrame, 200);
  } catch (err) {
    console.log('[Webcam Error]', err);
    alert('Webcam access denied or device busy: ' + err.message);
  }
};


  const stopWebcam = () => {
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      clearInterval(videoRef.current.intervalId);
    }
    socketRef.current.emit('stop_transmission');
    setStreaming(false);
  };

  return (
    <div className="console-container">
      <h1>WaveDrive Console</h1>

      {!registered ? (
        <div className="ip-form">
          <input
            type="text"
            placeholder="Enter RPi IP"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <button onClick={registerIP}>Register IP</button>
        </div>
      ) : (
        <>
          <p className="registered-msg">Registered! You may start transmission.</p>

          <div className="video-wrapper">
            <div className="feed-container">
              <div className="feed">
                <h4>Webcam Feed</h4>
                <video
                  ref={videoRef}
                  width="100"
                  height="100"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width="700"
                  height="500"
                  style={{ background: '#eee', borderRadius: '4px' }}
                />
              </div>

              <div className="feed">
                <h4>RPi Feed</h4>
                {rpiFrame ? (
                  <img
                    src={rpiFrame}
                    alt="RPi Feed"
                    width="700"
                    height="500"
                    style={{ background: '#eee', borderRadius: '4px' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '700px',
                      height: '500px',
                      background: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      fontSize: '18px',
                      color: '#666'
                    }}
                  >
                    Waiting for RPi frame...
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3>
            Command: <span className="command">{command}</span>
          </h3>

          <button onClick={streaming ? stopWebcam : startWebcam}>
            {streaming ? 'Stop Feeds' : 'Start Feeds'}
          </button>
        </>
      )}
    </div>
  );
}

export default ConsoleComponent;
