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
        
    }
    catch (err)
    {
        console.error(err);
        return interaction.editReply({ ephemeral: true, content: 'An error occurred while deleting your profile.' });
    }
  },
};
