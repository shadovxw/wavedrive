# WaveDrive – Gesture-Controlled Car 🚗✋

WaveDrive is a **gesture-controlled smart car platform** that enables real-time vehicle control using hand gestures.  
It integrates computer vision, real-time communication, and microservices architecture to deliver a low-latency and robust control experience.  

---

## ✨ Features

- 🎥 **Gesture Recognition**: Uses **MediaPipe** + **OpenCV** to detect and classify hand gestures.  
- 🔄 **Microservices Architecture**:  
  - **Frontend (React)** – user interface for control and monitoring.  
  - **Vision Service (Flask + MediaPipe)** – processes camera frames for gesture recognition.  
  - **Relay Service (Node.js + Socket.IO)** – bridges gesture commands to the car.  
- ⚡ **Low Latency Pipeline**:  
  - Single-instance MediaPipe execution.  
  - Frame downscaling + JPEG compression.  
  - Gzip-enabled API responses.  
- 🔐 **Secure Communication** with CORS, JWT, and HttpOnly cookies (extendable).  
- 🖥 **Cross-Platform Deployment** on cloud VMs (Render, Oracle, or self-hosted).  

---

## 🏗️ Architecture
<img width="1187" height="361" alt="image" src="https://github.com/user-attachments/assets/10f29d76-85c7-48fe-a6d3-deb3f0087f8d" />
<img width="980" height="374" alt="image" src="https://github.com/user-attachments/assets/e7f54c29-9e0c-42d3-aa34-22bf2a51eab0" />
---

## 📂 Project Structure

```
WaveDrive/
├── frontend/           # React UI
├── backend/            # Node.js + Socket.IO relay
├── service/            # Flask + MediaPipe gesture detection
└── docs/               # Project documentation
```

---
---

## 🧪 Sample Gestures

* ✋ Palm → **Stop**
* 👉 Point Right → **Turn Right**
* 👈 Point Left → **Turn Left**
* ✊ Fist → **Move Forward**
* 🖐️ Open Hand → **Move Backward**

*(Custom gestures can be trained by extending the MediaPipe model.)*

---

Now:

* Frontend → `http://localhost:3000`
* Backend → `http://localhost:5000`
* Service → `http://localhost:5001`

---

## 🔧 Tech Stack

* **Frontend**: React
* **Backend**: Node.js, Express, Socket.IO
* **Service**: Python, Flask, MediaPipe, OpenCV
* **Hardware**: Raspberry Pi / Motor Driver module

---

## Prototype
<img width="1008" height="553" alt="image" src="https://github.com/user-attachments/assets/483fccc4-bb88-4b59-a03b-50a83af58aec" />

---

## 📜 License

MIT License © 2025 Vrishank Warrier

