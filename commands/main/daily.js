const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect daily points.'),
  async execute(interaction)
  {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    try 
    {
      const member = await interaction.guild.members.fetch(userId);

      const profile = await createProfile(member, {
        points: 10,
        lastClaimed: new Date()
      });

      if (profile.points === 10 && profile.lastClaimed.getTime() === new Date().getTime()) 
      {
        return interaction.reply('New profile created! You have received **10** points.');
      }

      const now = new Date();
      const lastClaimed = profile.lastClaimed || new Date(0);

      const msInDay = 1000 * 60 * 60 * 24;
      const timeDiff = now - lastClaimed;

      if (timeDiff < msInDay) 
      {
        const hoursLeft = Math.ceil((msInDay - timeDiff) / (1000 * 60 * 60));
        return interaction.reply(`You’ve already claimed your daily reward. Try again in ${hoursLeft} hour(s)!`);
      }

      profile.points += 10;
      profile.lastClaimed = now;
      await profile.save();

      return interaction.reply(`You've claimed your daily reward and now have **${profile.points}** points!`);
    } 
    catch (err) 
    {
      console.error(err);
      return interaction.reply('Something went wrong. Please try again later.');
    }
  },
};