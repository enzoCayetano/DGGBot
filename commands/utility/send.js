const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send')
    .setDescription('Send message using DGG bot.'),
  requiredRoles: ['1237571670261371011', '1275018612922384455'],
  async execute(interaction)
  {
    // check for role
    const userHasRequiredRole = interaction.member.roles.cache.some(role =>
      this.requiredRoles.includes(role.id)
    );

    if (!userHasRequiredRole) 
    {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('sendMessageModal')
      .setTitle('Send Message');

    const messageInput = new TextInputBuilder()
      .setCustomId('sendMessageContent')
      .setLabel('What should the bot say?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(messageInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};