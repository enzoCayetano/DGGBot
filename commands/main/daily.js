const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect daily points.'),
  async execute(interaction)
  {
    try 
    {
      const profile = await createProfile(interaction.user, {
        points: 10,
        lastClaimed: new Date()
      });

      if (profile.points === 10 && profile.lastClaimed.getTime() === new Date().getTime()) 
      {
        return interaction.reply('New profile created! You have received **10** points.');
      }

      const now = new Date();
      const lastClaimed = profile.lastClaimed ? new Date(profile.lastClaimed) : new Date(0);

      const nowUTCDate = now.toISOString().split('T')[0];
      const lastClaimedUTCDate = lastClaimed.toISOString().split('T')[0];

      // if already claimed today
      if (nowUTCDate === lastClaimedUTCDate) 
      {
        const nextReset = new Date(nowUTCDate + 'T00:00:00Z');
        nextReset.setUTCDate(nextReset.getUTCDate() + 1);

        const msLeft = nextReset - now;
        const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60))
        return interaction.reply(`You have already claimed your daily points today. Please try again in ${hoursLeft} hour(s)!`);
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