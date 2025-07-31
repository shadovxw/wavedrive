// controller-service.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let registeredIP = null;
let transmissionActive = false;
const processorURL = 'http://localhost:6060/process'; // Python microservice

io.on('connection', (socket) => {
  console.log('[CONNECTED] Client');

  socket.on('register_ip', (data) => {
    registeredIP = '192.168.1.31';
    console.log(`[REGISTERED IP] ${registeredIP}`);
    if (!registeredIP) {
        console.warn('[WARNING] Registered IP is null or undefined!');
    }
    socket.emit('ip_registered', { message: `IP ${data.ip} registered.` });
  });


  socket.on('start_transmission', () => {
    transmissionActive = true;
    console.log(`[TRANSMISSION] Started`);
    io.emit('transmission_status', { status: 'started' });
  });

  socket.on('stop_transmission', () => {
    transmissionActive = false;
    console.log(`[TRANSMISSION] Stopped`);
    io.emit('transmission_status', { status: 'stopped' });
  });

  socket.on('frame', async (data) => {
    // if (!transmissionActive || socket.handshake.address !== registeredIP) {
    //   console.log('[BLOCKED FRAME] Unauthorized or inactive');
    //   return;
    // }

    try {
      console.log("frames", data.frame)
      const response = await axios.post(processorURL, { frame: data.frame });
      const { command, frame: processedFrame } = response.data;

      io.emit('webcam_result', { command, frame: processedFrame });

      // Send command to RPi
    //   await axios.post(`http://${registeredIP}:5000/command`, {
    //     command: command,
    //   });
    } catch (error) {
      console.error('[PROCESS ERROR]', error.message);
    }
  });

  socket.on('rpi_feed', (data) => {
    if (transmissionActive && socket.handshake.address === registeredIP) {
      io.emit('rpi_result', { rpi_frame: data.frame, source_ip: registeredIP });
    }
  });
});

app.get('/', (req, res) => res.send('Controller microservice running.'));
server.listen(5000, () => console.log('Controller service running on port 5000'));
