const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');
const updateProfile = require('../../library/updateProfile');
const roleTitles = require('../../json/roles.json');

module.exports = {
  // Slash command setup
  data: new SlashCommandBuilder()
    .setName('createprofile')
    .setDescription('Create a new profile.'),

  async execute(interaction) 
  {
    try
    {
        // Defer reply to allow time for DB operations
        await interaction.deferReply();

        // Fetch existing profile and member info
        const profile = await Profile.findOne({ userId: interaction.user.id });
        const member = await interaction.guild.members.fetch(interaction.user.id);

        // Block if profile already exists
        if (profile) 
        {
            await interaction.editReply({ content: 'You already have an existing profile.' });
            return;
        }

        // Create new profile and apply role titles
        const newProfile = await createProfile(interaction.user, member);
        await updateProfile(member, roleTitles);

        // Confirm success
        await interaction.editReply({ content: `Created a new profile for ${member.displayName}.` });
    }
    catch (err)
    {
        // Log and report error
        console.error(err);
        return interaction.editReply({ 
          ephemeral: true, 
          content: 'An error occurred creating a new profile.' 
        });
    }
  },
};
