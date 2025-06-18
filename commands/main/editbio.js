const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bio')
    .setDescription('Edit your user bio.'),
  async execute(interaction) 
  {
    const modal = new ModalBuilder()
      .setCustomId('editBioModal')
      .setTitle('Edit Biography');

    const messageInput = new TextInputBuilder()
      .setCustomId('editBioContent')
      .setLabel('What should your bio say?')
      .setPlaceholder('Write a short biography about yourself.')
      .setMaxLength(500)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(messageInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};
