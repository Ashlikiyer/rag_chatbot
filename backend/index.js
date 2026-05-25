const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const uploadRoute = require('./routes/upload');
const chatRoute = require('./routes/chat');
const statusRoute = require('./routes/status');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'RAG Chatbot API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/upload',
      chat: 'POST /api/chat',
      status: 'GET /api/chat/status'
    }
  });
});

// API Routes
app.use('/api/upload', uploadRoute);
app.use('/api/chat', chatRoute);
app.use('/status', statusRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds 10MB limit' });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 RAG Chatbot Backend Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Vector Store: ${process.env.VECTOR_STORE || 'chroma'}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  POST http://localhost:${PORT}/api/upload`);
  console.log(`  POST http://localhost:${PORT}/api/chat`);
  console.log(`  GET  http://localhost:${PORT}/api/chat/status`);
  console.log('\n' + '='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
