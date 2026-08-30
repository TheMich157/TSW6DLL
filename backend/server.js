const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const TSW_API_URL = process.env.TSW_API_URL || 'http://localhost:31270';
const TSW_API_KEY = process.env.TSW_API_KEY || 'dummy-key';

let gameState = {
  signals: [],
  trains: [],
  mapInfo: {}
};

// Simulate pulling data from TSW HTTP API
async function pollTswApi() {
  try {
    // In a real scenario:
    // const response = await axios.get(`${TSW_API_URL}/api/state`, { headers: { 'DTGCommKey': TSW_API_KEY } });
    // gameState = response.data;
    
    // For now we mock the data since TSW API might not be running or reachable
    gameState = {
      signals: [
        { id: 'sig_1', name: 'Signal A', state: 'Proceed', x: 100, y: 150, supportedStates: ['Proceed', 'Danger', 'Warning'] },
        { id: 'sig_2', name: 'Signal B', state: 'Danger', x: 300, y: 150, supportedStates: ['Proceed', 'Danger'] },
        { id: 'sig_3', name: 'Signal C', state: 'Warning', x: 500, y: 150, supportedStates: ['Proceed', 'Danger', 'Warning'] },
      ],
      trains: [
        { id: 'train_1', name: 'ICE 3', speed: 120, x: 200, y: 150, direction: 'east' },
        { id: 'train_2', name: 'RE 14', speed: 0, x: 400, y: 150, direction: 'west' }
      ],
      mapInfo: {
        routeId: 'Route_Example',
        routeName: 'Example Network'
      }
    };

    io.emit('gameStateUpdate', gameState);
  } catch (error) {
    console.error('Error fetching from TSW API:', error.message);
  }
}

// Poll every 2 seconds
setInterval(pollTswApi, 2000);

// API endpoint to override a signal state
app.post('/api/signals/:id/override', async (req, res) => {
  const signalId = req.params.id;
  const { newState } = req.body;

  if (!newState) {
    return res.status(400).json({ error: 'newState is required' });
  }

  console.log(`Received command to override signal ${signalId} to state ${newState}`);

  try {
    // In a real scenario, forward to TSW API if it supports POST/PUT:
    // await axios.post(`${TSW_API_URL}/api/signals/${signalId}`, { state: newState }, { headers: { 'DTGCommKey': TSW_API_KEY } });
    
    // Fallback/Mock logic:
    const signalIndex = gameState.signals.findIndex(s => s.id === signalId);
    if (signalIndex !== -1) {
      if (gameState.signals[signalIndex].supportedStates.includes(newState)) {
        gameState.signals[signalIndex].state = newState;
        // Broadcast immediately for responsiveness
        io.emit('gameStateUpdate', gameState);
        res.json({ success: true, message: `Signal ${signalId} overridden to ${newState}` });
      } else {
        res.status(400).json({ error: `State ${newState} not supported by signal ${signalId}` });
      }
    } else {
      res.status(404).json({ error: 'Signal not found' });
    }
  } catch (error) {
    console.error('Error overriding signal:', error.message);
    res.status(500).json({ error: 'Failed to override signal in TSW API' });
  }
});

// API endpoint to create a line for a given train
app.post('/api/trains/:id/route', async (req, res) => {
  const trainId = req.params.id;
  const { targetSignalId, pathSegments } = req.body;

  console.log(`Received command to route train ${trainId} to ${targetSignalId}`);

  try {
    // In a real scenario, this might set switches/points via API
    res.json({ success: true, message: `Route allocated for train ${trainId}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set route' });
  }
});

io.on('connection', (socket) => {
  console.log('Frontend connected:', socket.id);
  // Send immediate state upon connection
  socket.emit('gameStateUpdate', gameState);

  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`TSW6 Dispatcher Backend running on port ${PORT}`);
});
