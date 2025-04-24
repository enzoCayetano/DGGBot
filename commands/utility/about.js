const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('About this bot!'),
  async execute(interaction)
  {
    await interaction.reply('This bot was programmed by swag for dggcord. Shout out mommy wiv and daddy cill <3');
  },
};