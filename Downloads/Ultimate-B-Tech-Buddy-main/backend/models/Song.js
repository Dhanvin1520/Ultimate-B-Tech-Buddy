const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  artist: String,
  album: String,
  spotifyId: String,
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);
