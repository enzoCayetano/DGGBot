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
      let profile = await Profile.findOne({ userId: interaction.user.id });

      // if profile doesn't exist, create one
      if (!profile) 
        {
        profile = new Profile({
          username: interaction.user.username,
          userId: interaction.user.id,
          points: 0
        });
        await profile.save();
      }

      await interaction.reply({ content: `You currently have **${profile.points}** points.` });
    }
    catch (err)
    {
      console.error(err);
      return interaction.reply({ ephemeral: true, content: 'An error occurred while fetching your balance.' });
    }
  },
};
