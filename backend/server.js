require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const ChatMessage = require('./models/ChatMessage');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const songRoutes = require('./routes/songs');
const leetcodeRoutes = require('./routes/leetcode');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ultimate-b-tech-buddy.vercel.app',
  'https://ultimate-b-tech-buddy-anv1.vercel.app/',
  'https://ultimate-b-tech-buddy-xdn9-d7uitm5fb.vercel.app',
  'https://ultimate-b-tech-buddy-g2q9-e52gh2tkd.vercel.app',
  /\.vercel\.app$/,
  'https://ultimate-b-tech-buddy.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const PREDEFINED_ROOMS = [
  { id: 'nst-commons', name: 'NST Commons', description: 'General chatter for every NST student.' },
  { id: 'nst-placements', name: 'NST Placements', description: 'Internship/placement updates, referrals, and tips.' }
];

const DEFAULT_CHAT_ROOM = process.env.DEFAULT_CHAT_ROOM || PREDEFINED_ROOMS[0].id;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const validRoomIds = new Set(PREDEFINED_ROOMS.map((room) => room.id));
const DEFAULT_VIDEO_ROOM = process.env.DEFAULT_VIDEO_ROOM || 'nst-huddle';

const normalizeRoomId = (roomId = DEFAULT_CHAT_ROOM) => {
  if (typeof roomId !== 'string') return DEFAULT_CHAT_ROOM;
  const trimmed = roomId.trim().toLowerCase();
  if (!trimmed) return DEFAULT_CHAT_ROOM;
  if (validRoomIds.has(trimmed)) return trimmed;
  return DEFAULT_CHAT_ROOM;
};

const normalizeVideoRoomId = (roomId = DEFAULT_VIDEO_ROOM) => {
  if (typeof roomId !== 'string') return DEFAULT_VIDEO_ROOM;
  const trimmed = roomId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return trimmed || DEFAULT_VIDEO_ROOM;
};

const formatMessage = (doc, extra = {}) => ({
  id: doc._id?.toString() || doc.id,
  text: doc.text,
  userName: doc.userName,
  timestamp: doc.createdAt || doc.timestamp || new Date(),
  persisted: true,
  ...extra
});

const fallbackRoomCache = new Map();
const pendingPersistenceQueue = [];
const isMongoReady = () => mongoose.connection?.readyState === 1;

const addFallbackMessage = (roomId, message) => {
  const normalizedRoomId = normalizeRoomId(roomId);
  const existing = fallbackRoomCache.get(normalizedRoomId) || [];
  const filtered = existing.filter((msg) => new Date(msg.timestamp).getTime() >= Date.now() - THIRTY_DAYS_MS);
  filtered.push({ ...message, persisted: false });
  fallbackRoomCache.set(normalizedRoomId, filtered.slice(-200));
};

const removeFallbackMessage = (roomId, clientMessageId) => {
  if (!clientMessageId) return;
  const normalizedRoomId = normalizeRoomId(roomId);
  const existing = fallbackRoomCache.get(normalizedRoomId);
  if (!existing) return;
  const next = existing.filter((msg) => msg.clientMessageId !== clientMessageId);
  fallbackRoomCache.set(normalizedRoomId, next);
};

const getFallbackHistory = (roomId) => {
  const normalizedRoomId = normalizeRoomId(roomId);
  const history = fallbackRoomCache.get(normalizedRoomId) || [];
  return history.filter((msg) => new Date(msg.timestamp).getTime() >= Date.now() - THIRTY_DAYS_MS);
};

const queuePendingPersistence = (roomId, payload) => {
  pendingPersistenceQueue.push({ roomId: normalizeRoomId(roomId), payload });
};

const flushPendingPersistence = async () => {
  if (!pendingPersistenceQueue.length) return;
  if (!isMongoReady()) return;
  const pendingNow = pendingPersistenceQueue.splice(0, pendingPersistenceQueue.length);
  for (const entry of pendingNow) {
    try {
      const saved = await ChatMessage.create({
        roomId: entry.roomId,
        userName: entry.payload.userName || 'Anonymous',
        text: entry.payload.text,
      });
      removeFallbackMessage(entry.roomId, entry.payload.clientMessageId);
      const persistedPayload = formatMessage(saved, {
        clientMessageId: entry.payload.clientMessageId,
      });
      io.to(entry.roomId).emit('newMessage', persistedPayload);
    } catch (error) {
      console.error('Retry to persist chat message failed', error.message || error);
      pendingPersistenceQueue.push(entry);
    }
  }
};


const videoRooms = new Map();
const socketVideoRooms = new Map();
const videoPeerProfiles = new Map();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) return callback(new Error('Not allowed by CORS'), false);
    return callback(null, true);
  },
  credentials: true
}));

app.options('*', cors({
  origin: function (origin, callback) {
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
app.get('/api/chat/rooms', (req, res) => {
  res.json({ rooms: PREDEFINED_ROOMS });
});

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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) return callback(new Error('Not allowed by CORS'), false);
      return callback(null, true);
    },
    credentials: true,
  },
});

setInterval(flushPendingPersistence, 15000);
mongoose.connection.on('connected', flushPendingPersistence);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  const removeFromVideoRoom = (roomId) => {
    if (!roomId) return;
    const normalizedRoomId = normalizeVideoRoomId(roomId);
    const roomSet = videoRooms.get(normalizedRoomId);
    if (!roomSet) return;
    roomSet.delete(socket.id);
    if (roomSet.size === 0) {
      videoRooms.delete(normalizedRoomId);
    }
    const socketRooms = socketVideoRooms.get(socket.id);
    if (socketRooms) {
      socketRooms.delete(normalizedRoomId);
      if (!socketRooms.size) {
        socketVideoRooms.delete(socket.id);
        videoPeerProfiles.delete(socket.id);
      }
    }
    const videoRoomName = `video:${normalizedRoomId}`;
    socket.leave(videoRoomName);
    socket.to(videoRoomName).emit('video:peer-disconnected', { peerId: socket.id, roomId: normalizedRoomId });
  };

  socket.on('joinRoom', async ({ roomId, user }) => {
    const normalizedRoomId = normalizeRoomId(roomId);
    socket.join(normalizedRoomId);
    console.log(`[DEBUG] ${user?.name || socket.id} joined room: ${roomId} -> normalized: ${normalizedRoomId}`);

    try {
      const history = await ChatMessage.find({ roomId: normalizedRoomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      console.log(`[DEBUG] Fetched ${history.length} messages for room ${normalizedRoomId}`);
      const formattedHistory = history.reverse().map(doc => formatMessage(doc));
      socket.emit('roomHistory', formattedHistory);
    } catch (err) {
      console.error('[DEBUG] Failed to fetch chat history', err);
      socket.emit('roomHistory', []);
    }

    socket.to(normalizedRoomId).emit('systemMessage', { text: `${user?.name || 'Someone'} joined the room`, timestamp: new Date() });
  });

  socket.on('leaveRoom', ({ roomId, user }) => {
    const normalizedRoomId = normalizeRoomId(roomId);
    socket.leave(normalizedRoomId);
    socket.to(normalizedRoomId).emit('systemMessage', { text: `${user?.name || 'Someone'} left the room`, timestamp: new Date() });
  });

  socket.on('sendMessage', async ({ roomId, message }, callback) => {
    const normalizedRoomId = normalizeRoomId(roomId);
    console.log(`[DEBUG] sendMessage received for room ${normalizedRoomId}:`, message);
    const baseMessage = {
      id: message?.clientMessageId || `${Date.now()}-${Math.random()}`,
      text: message?.text,
      userName: message?.userName || 'Anonymous',
      timestamp: new Date(),
      clientMessageId: message?.clientMessageId,
    };
    try {
      const saved = await ChatMessage.create({
        roomId: normalizedRoomId,
        userName: message.userName || 'Anonymous',
        text: message.text
      });
      console.log(`[DEBUG] Message saved to DB: ${saved._id}`);
      const payload = formatMessage(saved, {
        clientMessageId: message?.clientMessageId,
      });
      removeFallbackMessage(normalizedRoomId, message?.clientMessageId);
      io.to(normalizedRoomId).emit('newMessage', payload);
      if (typeof callback === 'function') {
        callback({ ok: true, message: payload });
      }
    } catch (error) {
      console.error('Failed to save chat message', error);
      const fallbackPayload = { ...baseMessage, persisted: false };
      addFallbackMessage(normalizedRoomId, fallbackPayload);
      queuePendingPersistence(normalizedRoomId, fallbackPayload);
      io.to(normalizedRoomId).emit('newMessage', fallbackPayload);
      if (typeof callback === 'function') {
        callback({ ok: true, message: fallbackPayload, persisted: false });
      }
    }
  });

  socket.on('video:join', ({ roomId, userName }) => {
    const normalizedRoomId = normalizeVideoRoomId(roomId);
    const videoRoomName = `video:${normalizedRoomId}`;
    if (!videoRooms.has(normalizedRoomId)) {
      videoRooms.set(normalizedRoomId, new Set());
    }
    videoRooms.get(normalizedRoomId).add(socket.id);
    if (!socketVideoRooms.has(socket.id)) {
      socketVideoRooms.set(socket.id, new Set());
    }
    socketVideoRooms.get(socket.id).add(normalizedRoomId);
    const safeName = userName?.trim() || 'NST Student';
    videoPeerProfiles.set(socket.id, { userName: safeName });
    socket.join(videoRoomName);

    const peers = Array.from(videoRooms.get(normalizedRoomId))
      .filter((id) => id !== socket.id)
      .map((id) => ({
        peerId: id,
        userName: videoPeerProfiles.get(id)?.userName || 'NST Student'
      }));
    socket.emit('video:peers', { peers, roomId: normalizedRoomId });
    socket.to(videoRoomName).emit('video:peer-connected', {
      peerId: socket.id,
      userName: safeName,
      roomId: normalizedRoomId
    });
  });

  socket.on('video:signal', ({ roomId, targetId, data }) => {
    const normalizedRoomId = normalizeVideoRoomId(roomId);
    io.to(targetId).emit('video:signal', { from: socket.id, data, roomId: normalizedRoomId });
  });

  socket.on('video:leave', ({ roomId }) => {
    removeFromVideoRoom(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    const rooms = socketVideoRooms.get(socket.id);
    if (rooms) {
      [...rooms].forEach((roomId) => removeFromVideoRoom(roomId));
    }
    videoPeerProfiles.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try accessing: http://0.0.0.0:${PORT}/api/health`);
});