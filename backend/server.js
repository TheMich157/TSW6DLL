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

let trackedAddresses = [];

// Simulate pulling data from TSW HTTP API or DLL
async function pollTswApi() {
  if (trackedAddresses.length === 0) return;

  try {
    const updatedValues = [];
    
    // Poll the DLL for each tracked address
    for (let item of trackedAddresses) {
      try {
        const response = await axios.get(`${TSW_API_URL}/api/read`, {
          params: {
            address: item.offset,
            type: item.type,
            isOffset: true
          },
          timeout: 1000 // Don't hang forever
        });
        
        updatedValues.push({
          id: item.id,
          name: item.name,
          offset: item.offset,
          type: item.type,
          value: response.data.value,
          status: 'ok'
        });
      } catch (err) {
        updatedValues.push({
          ...item,
          value: null,
          status: 'error'
        });
      }
    }
    
    io.emit('memoryUpdate', updatedValues);
  } catch (error) {
    console.error('Error in polling loop:', error.message);
  }
}

// Poll every 1 second for responsiveness
setInterval(pollTswApi, 1000);

// Add a new memory address to track
app.post('/api/track', (req, res) => {
  const { name, offset, type } = req.body;
  if (!name || !offset || !type) {
    return res.status(400).json({ error: 'name, offset, and type are required' });
  }

  const newItem = {
    id: `mem_${Date.now()}`,
    name,
    offset,
    type,
    value: null,
    status: 'pending'
  };

  trackedAddresses.push(newItem);
  res.json({ success: true, item: newItem });
});

// Remove a memory address
app.delete('/api/track/:id', (req, res) => {
  trackedAddresses = trackedAddresses.filter(i => i.id !== req.params.id);
  res.json({ success: true });
});

// Write to a memory address
app.post('/api/write', async (req, res) => {
  const { offset, type, value } = req.body;
  if (!offset || !type || value === undefined) {
    return res.status(400).json({ error: 'offset, type, and value are required' });
  }

  try {
    const response = await axios.post(`${TSW_API_URL}/api/write`, {
      address: offset,
      type: type,
      value: value,
      isOffset: true
    });
    
    if (response.data.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'DLL failed to write memory' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with DLL' });
  }
});

io.on('connection', (socket) => {
  console.log('Frontend connected:', socket.id);
  // Send immediate state upon connection
  socket.emit('memoryUpdate', []);

  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`TSW6 Dispatcher Backend running on port ${PORT}`);
});
