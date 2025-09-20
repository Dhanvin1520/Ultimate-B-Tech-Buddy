const mongoose = require('mongoose');

const leetcodeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  status: { type: String, enum: ['solved', 'attempted', 'todo'], default: 'todo' },
  url: { type: String, required: true },
  tags: [String],
  lastAttempted: Date,
  notes: String,
  timeComplexity: String,
  spaceComplexity: String,
  solution: String
});

module.exports = mongoose.model('Leetcode', leetcodeSchema);
