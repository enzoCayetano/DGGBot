const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteprofile')
    .setDescription('Delete your profile.'),
  async execute(interaction) 
  {
    try
    {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.user.id;
        const profile = await Profile.findOneAndDelete({ userId });
        if (!profile) 
        {
            return interaction.editReply({ ephemeral: true, content: 'You do not have a profile to delete.' });
        }

        return interaction.editReply({ ephemeral: true, content: 'Your profile has been successfully deleted.' });
    }
    catch (err)
    {
        console.error(err);
        return interaction.editReply({ ephemeral: true, content: 'An error occurred while deleting your profile.' });
    }
  },
};
