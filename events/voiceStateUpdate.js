const { Events } = require('discord.js');
const Profile = require('../models/Profile');

const voiceStartTimestamps = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState)
  {
    const userId = newState.id;

    if (!oldState.channelId && newState.channelId) 
    {
        voiceStartTimestamps.set(userId, Date.now());
    }

    if (oldState.channelId && !newState.channelId) 
    {
        const joinedAt = voiceStartTimestamps.get(userId);
        if (!joinedAt) return;

        const duration = (Date.now() - joinedAt) / 1000;
        voiceStartTimestamps.delete(userId);

        const minutes = Math.floor(duration / 60);
        if (minutes < 1) return;

        const xpGain = minutes * 2;

        const profile = await Profile.findOne({ userId });
        if (!profile) return;
        profile.xp += xpGain;

        const nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000); // cap at 5000 XP
        if (profile.xp >= nextLevelXP)
        {
            profile.level++;
            profile.xp -= nextLevelXP;
        }

        await profile.save();
    }
  }
};