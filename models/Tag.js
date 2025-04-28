const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: { 
    type: String, 
    enum: ['simple', 'advanced'], 
    required: true 
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  embed: {
    title: { type: String, default: null },
    color: { type: String, default: null },
    footer: { type: String, default: null }
  }
});

module.exports = mongoose.model('Tag', tagSchema);
