const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
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
  lastActive: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Profile', profileSchema);