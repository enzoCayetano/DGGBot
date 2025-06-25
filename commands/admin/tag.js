const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Tag = require('../../models/Tag');

module.exports = {
  // Slash command setup with subcommands
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage tags.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new tag.'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edit an existing tag.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the tag to edit.')
            .setRequired(true)))
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
        
  // Required role IDs
  requiredRoles: ['1237571670261371011', '1275018612922384455'],

  async execute(interaction)
  {
    const subcommand = interaction.options.getSubcommand();

    // Check if user has one of the required roles
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

    // Ensure command is used in a server for certain subcommands
    if (
      ['create', 'delete'].includes(subcommand) &&
      (!interaction.guild || !interaction.member?.roles)
    ) {
      return interaction.reply({
        content: '❌ You must use this command in a server.',
        ephemeral: true
      });
    }

    // Handle 'create' tag subcommand
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
    // Handle 'edit' tag subcommand
    else if (subcommand === 'edit')
    {
      const name = interaction.options.getString('name').toLowerCase();
      console.log(name + ', ' + interaction.options.getString('name'));

      if (!name)
      {
        return await interaction.reply({
          content: `❌ Invalid tag name: \`${name}\`.`,
          ephemeral: true,
        });
      }

      const tag = await Tag.findOne({ name });

      if (!tag) 
      {
        return await interaction.reply({
          content: `❌ Tag \`${name}\` not found.`,
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`editTagModal:${tag._id}`)
        .setTitle('Edit Tag');

      const tagNameInput = new TextInputBuilder()
        .setCustomId('tagName')
        .setLabel('Tag name (unchangeable here)')
        .setStyle(TextInputStyle.Short)
        .setValue(tag.name)
        .setRequired(true);

      const tagContentInput = new TextInputBuilder()
        .setCustomId('tagContent')
        .setLabel('Message content...')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(tag.description || '')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(tagNameInput),
        new ActionRowBuilder().addComponents(tagContentInput)
      );

      await interaction.showModal(modal);
    }
    // Handle 'delete' tag subcommand
    else if (subcommand === 'delete')
    {
      const name = interaction.options.getString('name').toLowerCase();
      
      const tag = await Tag.findOne({ name });
      if (!tag)
      {
        return await interaction.reply({ 
          content: `❌ Tag \`${name}\` not found.`, 
          ephemeral: true,
        });
      }

      await Tag.deleteOne({ name });
      await interaction.reply({ 
        content: `🗑️ Tag \`${name}\` has been deleted.`,
        ephemeral: true,
      });
    }
    // Handle 'list' tag subcommand
    else if (subcommand === 'list') 
    {
      const tags = await Tag.find({});
  
      if (tags.length === 0) {
        return await interaction.reply({
          content: 'There are no tags yet!',
          ephemeral: true,
        });
      }

      const tagList = tags.map(tag => `.${tag.name}`).join(', ');

      return await interaction.reply({
        content: `${tagList}`
      });
    }
  }
};
