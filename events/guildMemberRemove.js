const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) 
  {
    // Get leave channel ID from environment variables
    const channelId = process.env.LEAVE_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return; // Exit if channel not found

    // Create goodbye embed
    const embed = new EmbedBuilder()
      .setColor('#c922c3')
      .setTitle('Goodbye!')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `We're sad to see you go, ${member.user.toString()}. Thank you for being a part of Dead Girl Gaming!`
      )
      .setTimestamp();

    // Send embed in leave channel
    channel.send({ embeds: [embed] });
  }
};
