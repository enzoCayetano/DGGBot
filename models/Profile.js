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
  repGivenToday: {
    type: [String],
    required: false,
    default: []
  },
  lastRepTarget: {
    type: String,
    required: false,
    default: null
  },
  lastRepDate: {
    type: Date,
    required: false,
    default: null
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
  tournamentsWon: {
    type: Number,
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

profileSchema.virtual('xpToNextLevel').get(function() {
  const required = Math.min(Math.floor(Math.pow(this.level, 1.5) * 50), 5000);
  return required - this.xp;
})

profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true});

module.exports = mongoose.model('Profile', profileSchema);