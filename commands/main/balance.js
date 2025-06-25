const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  // Slash command setup
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('See your current balance.'),

  async execute(interaction) 
  {
    try
    {
      // Defer reply to allow async database call
      await interaction.deferReply();

      // Look up user profile
      const profile = await Profile.findOne({ userId: interaction.user.id });

      // Handle case where profile does not exist
      if (!profile) 
      {
        await interaction.editReply({ 
          content: 'You don\'t currently have a profile yet. Please run `/daily` at least once to create one.' 
        });
        return;
      }

      // Show user balance
      await interaction.editReply({ 
        content: `You currently have **${profile.points}** Riokens.` 
      });
    }
    catch (err)
    {
      // Log and notify error
      console.error(err);
      return interaction.reply({ 
        ephemeral: true, 
        content: 'An error occurred while fetching your balance.' 
      });
    }
  },
};
