const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce a message using the bot.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('The channel to send the announcement in.')
        .setRequired(true)),
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

    const channel = interaction.options.getChannel('channel');
    if (!channel.isTextBased()) 
    {
      return interaction.reply({
        content: 'This channel is not suitable for announcements.',
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`announceModal-${channel.id}`)
      .setTitle('Create Announcement');

    const messageInput = new TextInputBuilder()
      .setCustomId('announcementMessage')
      .setLabel('Announcement Message')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter your announcement message here...')
      .setRequired(true)

    const firstActionRow = new ActionRowBuilder()
      .addComponents(messageInput);

    await interaction.showModal(modal);
  },
};