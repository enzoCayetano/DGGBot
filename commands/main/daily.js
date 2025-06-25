const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');
const createProfile = require('../../library/createProfile');

module.exports = {
  // Slash command setup
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect daily Riokens.'),

  async execute(interaction)
  {
    try 
    {
      const userId = interaction.user.id;
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Look up user profile
      const profile = await Profile.findOne({ userId });

      // Require profile to continue
      if (!profile)
      {
        return interaction.reply('You do not have a profile yet. Please create one first using `/createprofile`.');
      }

      // Check if daily has already been claimed
      if (profile.lastClaimed) 
      {
        const lastClaimedDate = new Date(profile.lastClaimed).toISOString().split('T')[0];

        // Block if claimed today
        if (lastClaimedDate === today) 
        {
          return interaction.reply(`You have already claimed your daily Riokens today. Please try again in ${hoursLeft} hour(s)!`);
        }
      }

      // Streak logic
      let streak = profile.dailyStreak || 0;
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      // Set streak
      if (profile.lastClaimed)
      {
        const lastClaimedDate = new Date(profile.lastClaimed).toISOString().split('T')[0];
        if (lastClaimedDate === yesterdayDate)
        {
          streak += 1;
        }
        else
        {
          streak = 1;
        }
      }
      else
      {
        streak = 1;
      }

      // Calculate rewards
      const baseReward = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
      const streakBonusPercent = Math.min(streak * 10, 100); // max +100%
      const totalReward = Math.floor(baseReward * (1 + streakBonusPercent / 100));

      profile.points += totalReward;
      profile.lastClaimed = now;
      profile.dailyStreak = streak;
      await profile.save();

      return interaction.reply({
        content: `You've claimed your daily reward of **${totalReward}** Riokens!\n` + 
          `Base: **${baseReward}**\n` + 
          `Streak: **${streak}** day(s)\n` + 
          `Bonus: **+${streakBonusPercent}**\n` + 
          `You now have **${profile.points}** Riokens.`
      });

    } 
    catch (err) 
    {
      // Log and report error
      console.error(err);
      return interaction.reply('Something went wrong. Please try again later.');
    }
  },
};
