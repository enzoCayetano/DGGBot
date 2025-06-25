const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pfp')
    .setDescription('Pull member profile picture.')
    .addUserOption(option => 
      option
        .setName('user')
        .setDescription('Which user.')
        .setRequired(false)),
        
  async execute(interaction)
  {
    // Use specified user or default to the command invoker
    const user = interaction.options.getUser('user') || interaction.user;

    // Get user's avatar URL with dynamic support and high resolution
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    // Reply with an embed showing the user's avatar
    await interaction.reply({
      embeds: [
        {
          color: 0x2b2d31, // Embed border color
          title: `${user.username}'s Avatar`,
          image: { url: avatarUrl }, // Embed image field with avatar
          footer: { text: `Requested by ${interaction.user.tag}` }
        }
      ]
    });
  },
};
