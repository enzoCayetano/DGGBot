const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');
const updateProfile = require('../../library/updateProfile');
const roleTitles = require('../../json/roles.json');

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
        const member = await interaction.guild.members.fetch(interaction.user.id);

        // if profile does exist
        if (profile) 
        {
            await interaction.editReply({ content: 'You already have an existing profile.' });
            return;
        }

        // create a new profile
        const newProfile = await createProfile(interaction.user, member);
        await updateProfile(member, roleTitles);

        await interaction.editReply({ content: `Created a new profile for ${member.displayName}.` });
    }
    catch (err)
    {
        console.error(err);
        return interaction.editReply({ ephemeral: true, content: 'An error occurred creating a new profile.' });
    }
  },
};
