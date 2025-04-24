const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage tags.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new tag.'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete an existing tag.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the tag to delete.')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all existing.')),

  async execute(interaction)
  {
    const subcommand = interaction.options.getSubCommand();

    if (subcommand === 'create')
    {
      const modal = new ModalBuilder()
        .setCustomId('createTagModal')
        .setTitle('Create New Tag');

      const tagNameInput = new TextInputBuilder()
        .setCustomId('tagName')
        .setLabel('Name of tag')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const tagContentInput = new TextInputBuilder()
        .setCustomId('tagContent')
        .setLabel('Message content...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(tagNameInput),
        new ActionRowBuilder().addComponents(tagContentInput)
      );

      await interaction.showModal(modal);
    }
  }
};