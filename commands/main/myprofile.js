const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const roleTitles = require('../../json/roles.json');
const updateProfile = require('../../library/updateProfile');
const renderProfileCard = require('../utility/renderProfile');

module.exports = {
  // Slash command setup
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('See a user\'s profile information.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view profile of')
        .setRequired(false)
    ),

  async execute(interaction) 
  {
    // Get target user or default to the command invoker
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;
    const username = targetUser.username;

    // Fetch full member object
    const member = await interaction.guild.members.fetch(userId);

    try 
    {
      // Update user profile with current role/title info
      await updateProfile(member, roleTitles);

      // Find profile from database
      const profile = await Profile.findOne({ userId });

      // Handle missing profile
      if (!profile) 
      {
        return interaction.reply({
          content: `${targetUser.id === interaction.user.id ? 'You don\'t' : `${username} doesn't`} have a profile yet.`,
          ephemeral: true
        });
      }

      const buffer = await renderProfileCard(profile, member);
      const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
      
      return interaction.reply({ files: [attachment] });
    } 
    catch (err) 
    {
      console.error(err);

      // Fallback error handling for replied/deferred state
      if (!interaction.replied && !interaction.deferred)
      {
        return interaction.reply({
          content: 'An error occurred while fetching the profile.',
          ephemeral: true,
        });
      }
      else
      {
        return interaction.followUp({
          content: 'An error occurred while fetching the profile.',
          ephemeral: true,
        });
      }
    }
  },
};
