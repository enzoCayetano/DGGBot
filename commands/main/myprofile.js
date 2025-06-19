const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const roleTitles = require('../../roles.json');
const updateProfile = require('../../library/updateProfile');

module.exports = {
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
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;
    const username = targetUser.username;
    const member = await interaction.guild.members.fetch(userId);

    try 
    {
      const profile = await Profile.findOne({ userId });

      // check if profile exists
      if (!profile) 
      {
        return interaction.reply({
          content: `${targetUser.id === interaction.user.id ? 'You don\'t' : `${username} doesn't`} have a profile yet.`,
          ephemeral: true
        });
      }

      await updateProfile(member, roleTitles);

      const embed = new EmbedBuilder()
        .setTitle(`${member.displayName}`)
        .setColor(roleTitles[profile.title]?.color || '#13ed5f')
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Title', value: roleTitles[profile.title]?.title, inline: true },
          { name: 'XP', value: profile.xp.toString(), inline: true },
          { name: 'Level', value: profile.level.toString(), inline: true },
          { name: 'Reputation', value: profile.reputation.toString(), inline: true },
          { name: 'Bio', value: profile.bio || 'No bio set.', inline: false },
          { name: 'Points', value: profile.points.toString(), inline: true },
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
      return interaction.reply('An error occurred while fetching the profile.');
    }
  },
};
