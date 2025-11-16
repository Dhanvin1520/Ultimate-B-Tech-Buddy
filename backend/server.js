require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const songRoutes = require('./routes/songs');
const leetcodeRoutes = require('./routes/leetcode');

const app = express();

const allowedOrigins = [
  'https://ultimate-b-tech-buddy-6bha.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) return callback(new Error('Not allowed by CORS'), false);
    return callback(null, true);
  },
  credentials: true
}));

app.options('*', cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) return callback(new Error('Not allowed by CORS'), false);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/leetcode', leetcodeRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API is running. Use /api/auth, /api/tasks, /api/notes, /api/songs, /api/leetcode'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try accessing: http://0.0.0.0:${PORT}/api/health`);
});