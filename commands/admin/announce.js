const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  // Slash command definition
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce a message using the bot.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('The channel to send the announcement in.')
        .setRequired(true)
    ),

  // Role IDs allowed to use this command
  requiredRoles: ['1237571670261371011', '1275018612922384455'],

  async execute(interaction)
  {
    // Check for required role
    const userHasRequiredRole = interaction.member.roles.cache.some(role =>
      this.requiredRoles.includes(role.id)
    );

    if (!userHasRequiredRole) 
    {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');

    // Must be a text channel
    if (!channel.isTextBased()) 
    {
      return interaction.reply({
        content: 'This channel is not suitable for announcements.',
        ephemeral: true
      });
    }

    // Create modal
    const modal = new ModalBuilder()
      .setCustomId(`announceModal-${channel.id}`)
      .setTitle('Create Announcement');

    // Message input field
    const messageInput = new TextInputBuilder()
      .setCustomId('announcementMessage')
      .setLabel('Announcement Message')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter your announcement message here...')
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
