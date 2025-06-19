const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createprofile')
    .setDescription('Create a new profile.'),
  async execute(interaction) 
  {
    try
    {
        await interaction.deferReply();
        const profile = await Profile.findOne({ userId: interaction.user.id });

        // if profile does exist
        if (profile) 
        {
            await interaction.editReply({ content: 'You already have an existing profile.' });
            return;
        }

        // create a new profile
        const newProfile = await createProfile(interaction.user, {
            points: 0,
            lastClaimed: null
        });

        await interaction.editReply({ content: `Created a new profile for ${interaction.user.username}.` });
    }
    catch (err)
    {
        console.error(err);
        return interaction.editReply({ ephemeral: true, content: 'An error occurred creating a new profile.' });
    }
  },
};
