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
      if (tag.embed && tag.embed.title)
      {
        const embed = {
          description: tag.description,
          color: parseInt(tag.embed.color?.replace(/^#/, ''), 16) || 0x5865F2,
          title: tag.embed.title || undefined,
          footer: tag.embed.footer ? { text: tag.embed.footer } : undefined
        };
        return message.channel.send({ embeds: [embed] });
      }
      else
      {
        return message.channel.send(tag.description);
      }
    }
  }
};