const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce a message using the bot.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('The channel to send the announcement in.')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('The message to announce.')
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
    const message = interaction.options.getString('message');
    
    if (!channel.isTextBased()) 
    {
      return interaction.reply({
        content: 'That channel cannot receive text messages.',
        ephemeral: true,
      });
    }

    await channel.send(message);
    await interaction.reply({ content: 'Announcement sent successfully!', ephemeral: true });
  },
};