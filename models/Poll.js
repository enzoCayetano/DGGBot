const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    creatorId: { type: String, required: true },

    title: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],

    voters: [{ type: String }], // user IDs
    endsAt: { type: Date, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', pollSchema);