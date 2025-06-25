const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) 
  {
    // Get welcome channel ID from environment variables
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return; // Exit if channel not found

    // Create welcome embed
    const embed = new EmbedBuilder()
      .setColor('#8122c9')
      .setTitle('Welcome!')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `Welcome to Dead Girl Gaming, ${member.user.toString()}! Check out our ` +
        `[rules](https://discord.com/channels/1226974556636450856/1227383792554086420), ` +
        `[roles](https://discord.com/channels/1226974556636450856/1234254464718733323), and introduce yourself in the ` +
        `[introductions](https://discord.com/channels/1226974556636450856/1227387874282963085) channel.`
      )
      .setTimestamp();

    // Send embed in welcome channel
    channel.send({ embeds: [embed] });
  }
};