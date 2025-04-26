const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const Tag = require('../../models/Tag');

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
    const subcommand = interaction.options.getSubcommand();

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
    else if (subcommand === 'delete')
    {
      const name = interaction.options.getString('name').toLowerCase();
      
      const tag = await Tag.findOne({ name });
      if (!tag)
      {
        return await interaction.reply({ 
          content: `❌ Tag \`${name}\` not found.`, 
          flags: MessageFlags.Ephemeral,
        });
      }

      await Tag.deleteOne({ name });
      await interaction.reply({ 
        content: `🗑️ Tag \`${name}\` has been deleted.`, 
        flags: MessageFlags.Ephemeral,
      });
    }
    else if (subcommand === 'list')
    {
      const tags = await Tag.find({});
      if (tags.length === 0)
      {
        return await interaction.reply({ 
          content: 'There are no tags yet!', 
          flags: MessageFlags.Ephemeral,
        });
      }

      const tagList = tags.map(tag => `• \`${tag.name}\``).join('\n');
      await interaction.reply({ content: `📦 **Existing Tags:**\n${tagList}` });
    }
  }
};