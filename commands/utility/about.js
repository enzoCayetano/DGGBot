const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('About this bot!'),
  async execute(interaction)
  {
    const client = interaction.client;
    const guilds = client.guilds.cache.map(g => g.name).join('\n');

    const response = `**Servers I'm in:**\n${guilds}`;
    
    await interaction.reply({
      content: response.length < 2000 ? response : "I'm in too many servers to list here.",
      ephemeral: true,
    });
  },
};