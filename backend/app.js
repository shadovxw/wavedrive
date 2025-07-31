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

const processorURL = 'https://wavedrive-service.onrender.com/process'; // Flask microservice

io.on('connection', (socket) => {
  console.log('[CONNECTED] Client');

  // Register the Raspberry Pi IP
  socket.on('register_ip', (data) => {
    registeredIP = data.ip || '192.168.1.31';
    console.log(`[REGISTERED IP] ${registeredIP}`);
    socket.emit('ip_registered', { message: `IP ${registeredIP} registered.` });
  });

  // Start webcam transmission
  socket.on('start_transmission', () => {
    transmissionActive = true;
    console.log('[TRANSMISSION] Started');
    io.emit('transmission_status', { status: 'started' });
  });

  // Stop webcam transmission
  socket.on('stop_transmission', () => {
    transmissionActive = false;
    console.log('[TRANSMISSION] Stopped');
    io.emit('transmission_status', { status: 'stopped' });
  });

  // Receive frame from frontend → send to Flask → forward result back
  socket.on('frame', async (data) => {
    try {
      if (!data?.frame) return;

      const response = await axios.post(
        processorURL,
        { frame: data.frame },
        {
          headers: {
            'Accept-Encoding': 'gzip' // request compressed response
          },
          decompress: true
        }
      );

      const { command, frame: processedFrame } = response.data;

      io.emit('webcam_result', { command, frame: processedFrame });

      // Optional: send command to Raspberry Pi
      // await axios.post(`http://${registeredIP}:5000/command`, { command });

    } catch (error) {
      console.error('[FRAME PROCESS ERROR]', error?.message || error);
    }
  });

  // RPi sends live feed to dashboard
  socket.on('rpi_feed', (data) => {
    if (
      transmissionActive &&
      socket.handshake.address === registeredIP
    ) {
      io.emit('rpi_result', {
        rpi_frame: data.frame,
        source_ip: registeredIP
      });
    }
  });

  // Optional: clean up on disconnect
  socket.on('disconnect', () => {
    console.log('[DISCONNECTED] Client');
  });
});

// Simple health route
app.get('/', (req, res) => res.send('Controller microservice running.'));

server.listen(5000, () =>
  console.log('[STARTED] Controller service on port 5000')
);
