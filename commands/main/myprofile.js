const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

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

      const embed = new EmbedBuilder()
        .setTitle(`${username}'s Profile`)
        .setColor(0x00AE86)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
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
