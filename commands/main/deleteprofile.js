const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  // Slash command setup
  data: new SlashCommandBuilder()
    .setName('deleteprofile')
    .setDescription('Delete your profile.'),

  async execute(interaction) 
  {
    try
    {
        // Defer reply (ephemeral so only user sees it)
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;

        // Attempt to delete profile
        const profile = await Profile.findOneAndDelete({ userId });

        // Handle if no profile found
        if (!profile) 
        {
            return interaction.editReply({ 
              ephemeral: true, 
              content: 'You do not have a profile to delete.' 
            });
        }

        // Confirm deletion
        return interaction.editReply({ 
          ephemeral: true, 
          content: 'Your profile has been successfully deleted.' 
        });
    }
    catch (err)
    {
        // Log and report error
        console.error(err);
        return interaction.editReply({ 
          ephemeral: true, 
          content: 'An error occurred while deleting your profile.' 
        });
    }
  },
};
