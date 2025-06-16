const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    default: 'Member',
    trim: true
  },
  xp: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  reputation: {
    type: Number,
    required: true,
    default: 0,
    min: -256
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  bio: {
    type: String,
    required: true,
    default: 'No bio set.',
    trim: true
  },
  joinedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastClaimed: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Profile', profileSchema);