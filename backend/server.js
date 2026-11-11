import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static phone transmitter page if accessed directly on backend port
app.use(express.static(path.join(__dirname, '../public')));

// In-Memory Database / Cache for GPS coordinates & detections
let latestLocation = null;
const locationHistory = [];
const detectionHistory = [];
const MAX_HISTORY = 2000;

// Validation helper
function isValidCoordinate(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' &&
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180;
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    hasLocation: !!latestLocation,
    historyCount: locationHistory.length,
    detectionsCount: detectionHistory.length
  });
});

/**
 * POST /api/gps/location
 * Receives: { robotId, latitude, longitude, accuracy, timestamp, heading, speed }
 */
app.post('/api/gps/location', (req, res) => {
  const { robotId = 'ROBOT-DOG-01', latitude, longitude, accuracy, timestamp, heading = 0, speed = 0 } = req.body;

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  const accNum = accuracy !== undefined ? parseFloat(accuracy) : null;

  if (!isValidCoordinate(latNum, lngNum)) {
    return res.status(400).json({
      error: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.'
    });
  }

  const record = {
    robotId,
    latitude: latNum,
    longitude: lngNum,
    accuracy: accNum,
    heading: parseFloat(heading) || 0,
    speed: parseFloat(speed) || 0,
    timestamp: timestamp || new Date().toISOString(),
    serverReceivedAt: new Date().toISOString()
  };

  latestLocation = record;
  locationHistory.push(record);
  if (locationHistory.length > MAX_HISTORY) {
    locationHistory.shift();
  }

  // Broadcast to all connected web dashboards
  io.emit('gps_update', record);

  return res.status(200).json({
    success: true,
    message: 'GPS location received and broadcasted',
    data: record
  });
});

/**
 * GET /api/gps/location
 * Returns the latest recorded GPS location
 */
app.get('/api/gps/location', (req, res) => {
  if (!latestLocation) {
    return res.status(404).json({
      status: 'no_data',
      message: 'No GPS coordinates have been received yet from the smartphone.'
    });
  }
  res.json({
    status: 'success',
    data: latestLocation
  });
});

/**
 * GET /api/gps/history
 * Returns the breadcrumb patrol route
 */
app.get('/api/gps/history', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 500;
  const recent = locationHistory.slice(-limit);
  res.json({
    status: 'success',
    count: recent.length,
    data: recent
  });
});

/**
 * POST /api/gps/detection
 * Records a stray dog detection at the current location
 */
app.post('/api/gps/detection', (req, res) => {
  const { robotId = 'ROBOT-DOG-01', dogName, breed, confidence, latitude, longitude, timestamp, imageUrl, tag } = req.body;

  const latNum = parseFloat(latitude || (latestLocation ? latestLocation.latitude : 0));
  const lngNum = parseFloat(longitude || (latestLocation ? latestLocation.longitude : 0));

  if (!isValidCoordinate(latNum, lngNum)) {
    return res.status(400).json({ error: 'Valid coordinates required for detection logging.' });
  }

  const detection = {
    id: `det-${Date.now()}`,
    robotId,
    dogName: dogName || 'Stray Dog',
    breed: breed || 'Indie / Mixed Breed',
    tag: tag || 'Stray',
    confidence: confidence || 0.92,
    latitude: latNum,
    longitude: lngNum,
    timestamp: timestamp || new Date().toISOString(),
    imageUrl: imageUrl || null
  };

  detectionHistory.push(detection);
  if (detectionHistory.length > 500) detectionHistory.shift();

  // Broadcast detection event
  io.emit('dog_detected', detection);

  res.status(201).json({
    success: true,
    data: detection
  });
});

/**
 * GET /api/gps/detections
 * Returns list of recorded stray dog detection events
 */
app.get('/api/gps/detections', (req, res) => {
  res.json({
    status: 'success',
    count: detectionHistory.length,
    data: detectionHistory
  });
});

/**
 * DELETE /api/gps/history
 * Clears current session history (optional helper)
 */
app.delete('/api/gps/history', (req, res) => {
  locationHistory.length = 0;
  latestLocation = null;
  io.emit('history_cleared');
  res.json({ success: true, message: 'Patrol route history cleared on server' });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial state immediately upon connection
  if (latestLocation) {
    socket.emit('gps_update', latestLocation);
  }
  socket.emit('history_sync', locationHistory.slice(-200));
  socket.emit('detections_sync', detectionHistory);

  // Client can also push direct GPS updates via socket
  socket.on('send_gps', (data, callback) => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (isValidCoordinate(lat, lng)) {
      const record = {
        robotId: data.robotId || 'ROBOT-DOG-01',
        latitude: lat,
        longitude: lng,
        accuracy: parseFloat(data.accuracy) || 5,
        heading: parseFloat(data.heading) || 0,
        speed: parseFloat(data.speed) || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        serverReceivedAt: new Date().toISOString()
      };
      latestLocation = record;
      locationHistory.push(record);
      if (locationHistory.length > MAX_HISTORY) {
        locationHistory.shift();
      }
      io.emit('gps_update', record);

      if (typeof callback === 'function') {
        callback({ success: true, timestamp: Date.now() });
      }
    } else if (typeof callback === 'function') {
      callback({ success: false, error: 'Invalid coordinates' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` PawPatrol Live GPS Backend Server running on port ${PORT}`);
  console.log(` Local:    http://localhost:${PORT}`);
  console.log(` Health:   http://localhost:${PORT}/api/health`);
  console.log(` GPS API:  POST & GET http://localhost:${PORT}/api/gps/location`);
  console.log(` Socket:   ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});

