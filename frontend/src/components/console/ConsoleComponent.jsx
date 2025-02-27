import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function ConsoleComponent() {
    const [streaming, setStreaming] = useState(false);
    const [viewCode, setViewCode] = useState(false);
    const [liveFrame, setLiveFrame] = useState(null);
    const [gestureFrame, setGestureFrame] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    let intervalId = null;

    const backendURL = 'http://localhost:5000'; // Change this to your backend server

    // Start Webcam
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            setStreaming(true);

            intervalId = setInterval(() => {
                sendFrameToBackend();
            }, 100); // Sends frames every 100ms
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    // Stop Webcam
    const stopWebcam = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        clearInterval(intervalId);
        setStreaming(false);
    };

    // Send Frame to Backend
    const sendFrameToBackend = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('frame', blob, 'frame.jpg');

            axios.post(`${backendURL}/upload-frame`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            .then(response => console.log("Frame sent successfully"))
            .catch(error => console.error("Error sending frame:", error));
        }, 'image/jpeg');
    };

    // Fetch Frames from Backend
    const fetchFrames = () => {
        axios.get(`${backendURL}/get-live-frame`, { responseType: 'blob' })
            .then(response => setLiveFrame(URL.createObjectURL(response.data)))
            .catch(error => console.error("Error fetching live frame:", error));

        axios.get(`${backendURL}/get-gesture-frame`, { responseType: 'blob' })
            .then(response => setGestureFrame(URL.createObjectURL(response.data)))
            .catch(error => console.error("Error fetching gesture frame:", error));
    };

    useEffect(() => {
        const interval = setInterval(fetchFrames, 500); // Fetch frames every 500ms
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Webcam Stream & Frame Processing</h1>

            {/* Webcam View & Canvas Processing */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <video ref={videoRef} width="320" height="240" autoPlay playsInline hidden={!streaming}></video>
                <canvas ref={canvasRef} width="320" height="240" style={{ display: streaming ? 'block' : 'none' }}></canvas>
            </div>

            {/* Buttons */}
            <div style={{ marginTop: '20px' }}>
                <button onClick={streaming ? stopWebcam : startWebcam} style={buttonStyle}>
                    {streaming ? "Stop Webcam" : "Start Webcam"}
                </button>
                <button onClick={() => setViewCode(!viewCode)} style={buttonStyle}>
                    {viewCode ? "Hide Code" : "View Code"}
                </button>
            </div>

            {/* Received Frames from Backend */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '20px' }}>
                <div>
                    <h3>Live Feed from RPi</h3>
                    {liveFrame ? <img src={liveFrame} width="320" height="240" alt="Live Feed" /> : <p>No feed available</p>}
                </div>
                <div>
                    <h3>Gestures Captured</h3>
                    {gestureFrame ? <img src={gestureFrame} width="320" height="240" alt="Gesture Feed" /> : <p>No gestures available</p>}
                </div>
            </div>

            {/* Code Viewer */}
            {viewCode && (
                <pre style={{ textAlign: 'left', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', marginTop: '20px', overflowX: 'auto' }}> {`NO CODE IMPLEMENTED YET`}
                </pre>
            )}
        </div>
    );
}

// Button Styles
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
