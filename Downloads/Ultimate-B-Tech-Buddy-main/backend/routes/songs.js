const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Song = require('../models/Song');

router.post('/', auth, async (req, res) => {
  try {
    const song = new Song({
      ...req.body,
      user: req.user.id
    });
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const songs = await Song.find({ user: req.user.id });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ message: 'Song removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
