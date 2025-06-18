//
const { SlashCommandBuilder } = require('discord.js');
const welcomeEvent = require('../../events/welcomeMember'); // path to your event
const leaveEvent = require('../../events/leaveMember'); // path to your event

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Test the welcome message. (and leave message)'),

  async execute(interaction) 
  {
    await interaction.reply({ content: 'Triggering welcome and leave event...', ephemeral: true });

    // Manually run the event using the interaction.member as the fake "member"
    welcomeEvent.execute(interaction.member);
    leaveEvent.execute(interaction.member);
  },
};
