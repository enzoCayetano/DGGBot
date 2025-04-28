const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const Tag = require('../../models/Tag');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage tags.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new tag.')
        .addStringOption(option => 
          option
            .setName('type')
            .setDescription('Choose between simple or advanced tag creation.')
            .setRequired(true)
            .addChoices(
              { name: 'Simple', value: 'simple' },
              { name: 'Advanced', value: 'advanced' },
            )
        ))
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
  requiredRoles: ['1237571670261371011', '1275018612922384455'],
  async execute(interaction)
  {
    const subcommand = interaction.options.getSubcommand();

    // check for role
    const userHasRequiredRole = interaction.member.roles.cache.some(role =>
      this.requiredRoles.includes(role.id)
    );

    // check if role is in server
    if (
      ['create', 'delete'].includes(subcommand) &&
      (!interaction.guild || !interaction.member?.roles)
    ) {
      return interaction.reply({
        content: '❌ You must use this command in a server.',
        ephemeral: true
      });
    }    

    if (subcommand === 'create')
    {
      const type = interaction.options.getString('type');

      const modal = new ModalBuilder()
        .setCustomId(type === 'simple' ? 'createTagModal' : 'createTagModalAdvanced')
        .setTitle(type === 'simple' ? 'Create New Tag' : 'Advanced Tag Creator');

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

      modal.addComponents(new ActionRowBuilder().addComponents(tagNameInput));

      if (type === 'simple')
      {
        modal.addComponents(new ActionRowBuilder().addComponents(tagContentInput));
      }
      else
      {
        const embedTitleInput = new TextInputBuilder()
          .setCustomId('embedTitle')
          .setLabel('Embed Title (optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

          const embedColorInput = new TextInputBuilder()
          .setCustomId('embedColor')
          .setLabel('Embed Color (hex, optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);
    
        const footerInput = new TextInputBuilder()
          .setCustomId('embedFooter')
          .setLabel('Footer text (optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);
    
        modal.addComponents(
          new ActionRowBuilder().addComponents(tagContentInput),
          new ActionRowBuilder().addComponents(embedTitleInput),
          new ActionRowBuilder().addComponents(embedColorInput),
          new ActionRowBuilder().addComponents(footerInput)
        );
      }

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
          ephemeral: true,
        });
      }

      await Tag.deleteOne({ name });
      await interaction.reply({ 
        content: `🗑️ Tag \`${name}\` has been deleted.`,
        ephemeral: true,
      });
    }
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