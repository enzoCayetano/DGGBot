const { Events } = require('discord.js');
const Tag = require('../models/Tag');
const prefix = '.';

module.exports = {
  name: Events.MessageCreate,
  async execute(message)
  {
    if (message.author.bot) return;

    const userId = message.author.id;

    try
    {
      const profile = await Profile.findOne ({ userId });
      if (!profile) return;

      const xpGain = Math.floor(Math.random() * 11) + 5;
      profile.xp += xpGain;

      const nextLevelXP = Math.min(Math.floor(Math.pow(profile.level, 1.5) * 50), 5000); // cap at 5000 XP
      if (profile.xp >= nextLevelXP)
      {
        profile.level++;
        profile.xp -= nextLevelXP;
        // await message.channel.send(`${message.author}, you leveled up to level ${profile.level}!`);
      }

      await profile.save();
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