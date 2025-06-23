const { Events } = require('discord.js');
const Tag = require('../models/Tag');
const Profile = require('../models/Profile')
const prefix = '.';

const xpCooldowns = new Map();
const XP_COOLDOWN_MS = 60 * 1000;

module.exports = {
  name: Events.MessageCreate,
  async execute(message)
  {
    if (message.author.bot) return;

    const userId = message.author.id;

    const lastXpGain = xpCooldowns.get(userId) ?? 0;
    if (Date.now() - lastXpGain < XP_COOLDOWN_MS) return;

    try
    {
      const profile = await Profile.findOne ({ userId });
      if (!profile) return;

      const xpGain = Math.floor(Math.random() * 11) + 5;

      profile.xp += xpGain;

      let nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000)

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
      console.error(`Error updating XP for ${userId}:`, err);
      return;
    }

    // handle tags

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const tag = await Tag.findOne({ name: commandName });
    if (tag)
    {
      return message.channel.send(tag.description);
    }
  }
};