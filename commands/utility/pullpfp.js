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
    const user = interaction.options.getUser('user') || interaction.user;

    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    await interaction.reply({
      embeds: [
        {
          color: 0x2b2d31,
          title: `${user.username}'s Avatar`,
          image: { url: avatarUrl },
          footer: { text: `Requested by ${interaction.user.tag}` }
        }
      ]
    });
  },
};