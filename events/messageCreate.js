const { Events } = require('discord.js');
const Tag = require('../models/Tag');
const prefix = '.';

module.exports = {
  name: Events.MessageCreate,
  async execute(message)
  {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const tag = await Tag.findOne({ name: commandName });
    if (tag)
    {
      return message.channel.send(tag.description);
    }
  }
};