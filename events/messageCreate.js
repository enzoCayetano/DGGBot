const { Events } = require('discord.js');
const Tag = require('../models/Tag');
const Profile = require('../models/Profile');
const prefix = '.';

// Map to store user cooldowns for XP gain
const xpCooldowns = new Map();
// Cooldown duration between XP gains (1 minute)
const XP_COOLDOWN_MS = 60 * 1000;

module.exports =
{
  name: Events.MessageCreate,

  async execute(message)
  {
    // Ignore messages from bots
    if (message.author.bot)
      return;

    const userId = message.author.id;

    // Check if user is on XP cooldown
    const lastXpGain = xpCooldowns.get(userId) ?? 0;
    if (Date.now() - lastXpGain < XP_COOLDOWN_MS)
      return;

    try
    {
      // Find user profile in DB
      const profile = await Profile.findOne({ userId });
      if (!profile)
        return;

      // Calculate random XP gain between 5 and 15
      const xpGain = Math.floor(Math.random() * 11) + 5;
      profile.xp += xpGain;

      // Calculate XP needed for next level, capped at 5000
      let nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000);

      // Level up while XP is sufficient
      while (profile.xp >= nextLevelXP)
      {
        profile.level++;
        profile.xp -= nextLevelXP;
        nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000);
      }

      // Prevent negative XP values
      if (profile.xp < 0)
        profile.xp = 0;

      // Save updated profile to DB
      await profile.save();

      // Update cooldown timestamp
      xpCooldowns.set(userId, Date.now());
    }
    catch (err)
    {
      console.error(`Error updating XP for ${userId}:`, err);
      return;
    }

    // If message is not a command, exit
    if (!message.content.startsWith(prefix))
      return;

    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Look up tag command in DB
    const tag = await Tag.findOne({ name: commandName });
    if (tag)
    {
      // Send tag description as response
      return message.channel.send(tag.description);
    }
  }
};
