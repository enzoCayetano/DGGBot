const { Events } = require('discord.js');
const Profile = require('../models/Profile');

const voiceStartTimestamps = new Map();
const xpCooldowns = new Map();

const XP_COOLDOWN_MS = 60 * 1000;
const TIMESTAMP_EXPIRATION_MS = 24 * 60 * 60 * 1000;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState)
  {
    const userId = newState.id;

    if (!oldState.channelId && newState.channelId) 
    {
      const joinTime = newState.joinedTimeStamp ?? Date.now();

      voiceStartTimestamps.set(userId, joinTime);

      setTimeout(() => {
        voiceStartTimestamps.delete(userId);
      }, TIMESTAMP_EXPIRATION_MS);
    }

    if (oldState.channelId && !newState.channelId) 
    {
      const joinedAt = voiceStartTimestamps.get(userId);
      if (!joinedAt) return;

      const duration = (Date.now() - joinedAt) / 1000;
      voiceStartTimestamps.delete(userId);

      const minutes = Math.floor(duration / 60);
      if (minutes < 1) return;

      const lastXpGain = xpCooldowns.get(userId) ?? 0;
      if (Date.now() - lastXpGain < XP_COOLDOWN_MS) return;

      const xpGain = minutes * 2;

      try
      {
        const profile = await Profile.findOne({ userId });
        if (!profile) return;

        profile.xp += xpGain;

        let nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000); // cap at 5000 XP
        
        while (profile.xp >= nextLevelXP)
        {
          profile.level++;
          profile.xp -= nextLevelXP;
          nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000);
        }

        if (profile.xp < 0) profile.xp = 0;

        await profile.save();

        xpCooldowns.set(userId, Date.now());
      }
      catch (err)
      {

      }
    }
  }
};