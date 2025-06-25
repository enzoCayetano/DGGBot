const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const roleTitles = require('../../json/roles.json');
const updateProfile = require('../../library/updateProfile');

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

      // Build profile embed
      const embed = new EmbedBuilder()
        .setTitle(`${member.displayName}`)
        .setColor(roleTitles[profile.title]?.color || '#13ed5f')
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Title', value: roleTitles[profile.title]?.title, inline: true },
          { name: 'XP', value: profile.xp.toString(), inline: true },
          { name: 'XP to Next Level', value: (Math.max(0, profile.xpToNextLevel)).toString(), inline: false },
          { name: 'Level', value: profile.level.toString(), inline: true },
          { name: 'Reputation', value: profile.reputation.toString(), inline: true },
          { name: 'Bio', value: profile.bio || 'No bio set.', inline: false },
          { name: 'Riokens', value: profile.points.toString(), inline: false },
          { name: 'Tournaments Won', value: profile.tournamentsWon.toString(), inline: false },
          { name: 'Joined At', value: `<t:${Math.floor(profile.joinedAt.getTime() / 1000)}:D>`, inline: true },
          { name: 'Last Daily Claimed', value: profile.lastClaimed
            ? `<t:${Math.floor(profile.lastClaimed.getTime() / 1000)}:R>`
            : 'Never', inline: false }
        )
        .setFooter({ text: `User ID: ${userId}` });

      return interaction.reply({ embeds: [embed] });
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
