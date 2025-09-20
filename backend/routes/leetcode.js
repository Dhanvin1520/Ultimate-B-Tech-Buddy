const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Leetcode = require('../models/Leetcode');

router.post('/', auth, async (req, res) => {
  try {
    const problem = new Leetcode({
      ...req.body,
      user: req.user.id,
      lastAttempted: req.body.status === 'solved' || req.body.status === 'attempted' ? Date.now() : null
    });
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status, difficulty, tags } = req.query;
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };
    
    const problems = await Leetcode.find(query);
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (updates.status === 'solved' || updates.status === 'attempted') {
      updates.lastAttempted = Date.now();
    }
    
    const problem = await Leetcode.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true }
    );
    
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Leetcode.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
