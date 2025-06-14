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

  useEffect(() => {
    console.log('[Init] Connecting to socket server...');
    socketRef.current = io('https://wavedrive-backend.onrender.com');

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected:', socketRef.current.id);
    });

    socketRef.current.on('ip_registered', (data) => {
      console.log('[Server] IP Registered:', data.message);
      setRegistered(true);
    });

    socketRef.current.on('webcam_result', (data) => {
      console.log('[Socket] Received webcam_result');
      const img = new Image();
      img.src = data.frame;
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
        console.log('[Canvas] Webcam frame rendered');
      };
      setCommand(data.command);
    });

    socketRef.current.on('rpi_result', (data) => {
      console.log('[Socket] Received rpi_result');
      setRpiFrame(data.rpi_frame);
    });

    return () => {
      console.log('[Cleanup] Disconnecting socket...');
      socketRef.current.disconnect();
    };
  }, []);

  const registerIP = () => {
    if (ip.trim() !== '') {
      console.log('[Action] Registering IP:', ip);
      socketRef.current.emit('register_ip', { ip: ip.trim() });
    }
  };

  const startWebcam = async () => {
    console.log('[Action] Starting webcam...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    console.log('[Webcam] Stream started:', stream);
    setStreaming(true);

    socketRef.current.emit('start_transmission');
    console.log('[Socket] Sent start_transmission');

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
          console.log('[Socket] Sent frame');
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    };

    videoRef.current.intervalId = setInterval(sendFrame, 200);
  };

  const stopWebcam = () => {
    console.log('[Action] Stopping webcam...');
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      clearInterval(videoRef.current.intervalId);
    }
    socketRef.current.emit('stop_transmission');
    setStreaming(false);
    console.log('[Socket] Sent stop_transmission');
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
  autoPlay
  playsInline
  style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}
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
