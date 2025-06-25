const { Events } = require('discord.js');
const Profile = require('../models/Profile');

// Maps to track voice join timestamps and XP cooldowns
const voiceStartTimestamps = new Map();
const xpCooldowns = new Map();

// Constants for cooldown and timestamp expiration (in ms)
const XP_COOLDOWN_MS = 60 * 1000;
const TIMESTAMP_EXPIRATION_MS = 24 * 60 * 60 * 1000;

module.exports =
{
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState)
  {
    const userId = newState.id;

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId)
    {
      // Use provided join timestamp or current time as fallback
      const joinTime = newState.joinedTimestamp ?? Date.now();

      // Store join time
      voiceStartTimestamps.set(userId, joinTime);

      // Remove timestamp after expiration to avoid memory leaks
      setTimeout(() =>
      {
        voiceStartTimestamps.delete(userId);
      }, TIMESTAMP_EXPIRATION_MS);
    }

    // User left a voice channel
    if (oldState.channelId && !newState.channelId)
    {
      const joinedAt = voiceStartTimestamps.get(userId);
      if (!joinedAt)
        return;

      // Calculate time spent in voice (in seconds)
      const duration = (Date.now() - joinedAt) / 1000;
      voiceStartTimestamps.delete(userId);

      // Convert to full minutes
      const minutes = Math.floor(duration / 60);
      if (minutes < 1)
        return;

      // Check XP cooldown to prevent rapid XP gain
      const lastXpGain = xpCooldowns.get(userId) ?? 0;
      if (Date.now() - lastXpGain < XP_COOLDOWN_MS)
        return;

      // XP awarded: 2 XP per minute spent in voice
      const xpGain = minutes * 2;

      try
      {
        // Fetch user profile
        const profile = await Profile.findOne({ userId });
        if (!profile)
          return;

        // Add XP
        profile.xp += xpGain;

        // Calculate XP needed for next level (capped)
        let nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000);

        // Level up while XP exceeds threshold
        while (profile.xp >= nextLevelXP)
        {
          profile.level++;
          profile.xp -= nextLevelXP;
          nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000);
        }

        // Prevent negative XP
        if (profile.xp < 0)
          profile.xp = 0;

        // Save updated profile
        await profile.save();

        // Update XP cooldown timestamp
        xpCooldowns.set(userId, Date.now());
      }
      catch (err)
      {
        console.error(`Error updating XP for ${userId} on voice leave:`, err);
      }
    }
  }
};
