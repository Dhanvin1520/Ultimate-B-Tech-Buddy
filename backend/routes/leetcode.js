const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Leetcode = require('../models/Leetcode');

const slugify = (value = '') => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `problem-${Date.now()}`;
};

router.post('/', auth, async (req, res) => {
  try {
    const normalizedDifficulty = (req.body.difficulty || 'medium').toLowerCase();
    const normalizedStatus = (req.body.status || 'todo').toLowerCase();
    const payload = {
      user: req.user.id,
      problemId: req.body.problemId?.trim() || slugify(req.body.title || req.body.problemId),
      title: req.body.title?.trim() || 'Untitled Problem',
      difficulty: ['easy', 'medium', 'hard'].includes(normalizedDifficulty) ? normalizedDifficulty : 'medium',
      status: ['solved', 'attempted', 'todo'].includes(normalizedStatus) ? normalizedStatus : 'todo',
      url: req.body.url?.trim() || 'https://leetcode.com',
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      notes: req.body.notes,
      timeComplexity: req.body.timeComplexity,
      spaceComplexity: req.body.spaceComplexity,
      solution: req.body.solution,
      lastAttempted: ['solved', 'attempted'].includes(normalizedStatus) ? Date.now() : null
    };

    const existing = await Leetcode.findOne({ user: req.user.id, problemId: payload.problemId });
    if (existing) {
      return res.status(200).json(existing);
    }

    const problem = new Leetcode(payload);
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

router.post('/seed', auth, async (req, res) => {
  try {
    const problems = Array.isArray(req.body?.problems) ? req.body.problems : [];
    if (!problems.length) {
      return res.status(400).json({ message: 'No problems provided' });
    }

    const normalized = problems.map((problem, index) => {
      const normalizedDifficulty = (problem?.difficulty || 'medium').toLowerCase();
      const normalizedStatus = (problem?.status || 'todo').toLowerCase();
      const title = problem?.title?.trim() || `Untitled Problem ${index + 1}`;
      return {
        user: req.user.id,
        problemId: problem?.problemId?.trim() || slugify(problem?.title || problem?.problemId || `problem-${index}`),
        title,
        difficulty: ['easy', 'medium', 'hard'].includes(normalizedDifficulty) ? normalizedDifficulty : 'medium',
        status: ['solved', 'attempted', 'todo'].includes(normalizedStatus) ? normalizedStatus : 'todo',
        url: problem?.url?.trim() || 'https://leetcode.com',
        tags: Array.isArray(problem?.tags) ? problem.tags : [],
        notes: problem?.notes,
        timeComplexity: problem?.timeComplexity,
        spaceComplexity: problem?.spaceComplexity,
        solution: problem?.solution,
        lastAttempted: ['solved', 'attempted'].includes(normalizedStatus) ? Date.now() : null
      };
    });

    const candidateIds = normalized.map((problem) => problem.problemId);
    const existing = await Leetcode.find({
      user: req.user.id,
      problemId: { $in: candidateIds }
    }).select('problemId');
    const existingIds = new Set(existing.map((problem) => problem.problemId));
    const toInsert = normalized.filter((problem) => !existingIds.has(problem.problemId));

    if (!toInsert.length) {
      return res.status(200).json({ inserted: 0 });
    }

    const inserted = await Leetcode.insertMany(toInsert);
    res.status(201).json({ inserted: inserted.length });
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
