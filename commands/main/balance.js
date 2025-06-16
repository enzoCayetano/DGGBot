const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('See your current balance.'),
  async execute(interaction) 
  {
    try
    {
      await interaction.deferReply();
      const profile = await Profile.findOne({ userId: interaction.user.id });

      // if profile doesn't exist
      if (!profile) 
      {
        await interaction.editReply({ content: 'You don\'t currently have a profile yet. Please run `/daily` at least once to create one.' });
        return;
      }

      await interaction.editReply({ content: `You currently have **${profile.points}** points.` });
    }
    catch (err)
    {
      console.error(err);
      return interaction.reply({ ephemeral: true, content: 'An error occurred while fetching your balance.' });
    }
  },
};
