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
    default: "1239311742694199388",
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
    min: -256,
    max: 256
  },
  bio: {
    type: String,
    required: true,
    default: 'No bio set.',
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: 0
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