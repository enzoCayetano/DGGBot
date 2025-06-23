const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect daily Riokens.'),
  async execute(interaction)
  {
    try 
    {
      const profile = await Profile.findOne({ userId: interaction.user.id });

      if (!profile)
      {
        return interaction.reply('You do not have a profile yet. Please create one first using `/createprofile`.');
      }

      const now = new Date();

      if (profile.lastClaimed) 
      {
        const nowUTCDate = now.toISOString().split('T')[0];
        const lastClaimedUTCDate = new Date(profile.lastClaimed).toISOString().split('T')[0];

        if (nowUTCDate === lastClaimedUTCDate) 
        {
          const nextReset = new Date(nowUTCDate + 'T00:00:00Z');
          nextReset.setUTCDate(nextReset.getUTCDate() + 1);

          const msLeft = nextReset - now;
          const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
          return interaction.reply(`You have already claimed your daily Riokens today. Please try again in ${hoursLeft} hour(s)!`);
        }
      }

      profile.points += 10;
      profile.lastClaimed = now;
      await profile.save();

      return interaction.reply(`You've claimed your daily reward and now have **${profile.points}** Riokens!`);
    } 
    catch (err) 
    {
      console.error(err);
      return interaction.reply('Something went wrong. Please try again later.');
    }
  },
};