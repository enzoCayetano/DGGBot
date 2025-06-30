const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

const MAX_REP = 256;
const MIN_REP = -256;
const MOD_LOG_CHANNEL_ID = '1248095165047115827';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Give reputation to a user.')
    .addSubcommand(sub =>
      sub.setName('up')
        .setDescription('Give positive reputation to a user.')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to give reputation to.')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('down')
        .setDescription('Give negative reputation to a user.')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to give reputation to.')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('check')
        .setDescription('Check your reputation or another user\'s reputation.')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to check reputation for.')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset user reputation to 0.')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to check reputation for.')
            .setRequired(false))),
  requiredRoles: ['1237571670261371011', '1275018612922384455'],
  async execute(interaction)
  {
    try
    {
      const sub = interaction.options.getSubcommand();
      const user = interaction.options.getUser('target') || interaction.user;
      const actorId = interaction.user.id;
      const targetId = user.id;
      const nowDate = new Date().toISOString().split('T')[0];

      const actorMember = await interaction.guild.members.fetch(actorId);
      const targetMember = await interaction.guild.members.fetch(targetId);

      const actorProfile = await Profile.findOne({ userId: actorId });
      const targetProfile = await Profile.findOne({ userId: targetId });

      // Ensure profiles exist
      if (!actorProfile)
      {
        return interaction.reply({ 
          content: 'You do not have a profile. Please create one first.',
          ephemeral: true
        });
      }

      if (!targetProfile)
      {
        return interaction.reply({
          content: `${targetMember.displayName} does not currently have a profile.`,
          ephemeral: true
        });
      }

      // Reset daily reputation tracking if date changed
      if (actorProfile.lastRepDate !== nowDate)
      {
        actorProfile.repGivenToday = [];
        actorProfile.lastRepTarget = null;
        actorProfile.lastRepDate = nowDate;
      }

      // /rep check command
      if (sub === 'check')
      {
        await interaction.reply({ 
          content: `${targetMember.displayName} has a reputation of '${targetProfile.reputation}'.`,
        });
        return;
      }

      // Prevent self-repping
      if (targetId === actorId)
      {
        return interaction.reply({ 
          content: 'You cannot give reputation to yourself.',
          ephemeral: true
        });
      }

      // Prevent giving rep more than once to the same user
      if (actorProfile.repGivenToday.includes(targetId) || actorProfile.lastRepTarget === targetId)
      {
        return interaction.reply({ 
          content: `You have already given reputation to ${targetMember.displayName} today.`,
          ephemeral: true
        });
      }

      // Limit daily rep interactions
      if (actorProfile.repGivenToday.length >= 5)
      {
        return interaction.reply({ 
          content: 'You have reached the maximum number of users you can rep today.',
          ephemeral: true
        });
      }

      // Calculate new reputation
      const amount = (sub === 'up') ? 1 : -1;
      const newRep = targetProfile.reputation + amount;

      // Check reputation bounds
      if (newRep > MAX_REP)
      {
        return interaction.reply({ 
          content: `${targetMember.displayName} has reached the maximum reputation limit of ${MAX_REP}.`,
          ephemeral: true
        });
      }
      else if (newRep < MIN_REP)
      {
        return interaction.reply({ 
          content: `${targetMember.displayName} has reached the minimum reputation limit of ${MIN_REP}.`,
          ephemeral: true
        });
      }

      // Update target's reputation
      targetProfile.reputation = newRep;
      await targetProfile.save();

      // Update actor's rep history
      actorProfile.repGivenToday.push(targetId);
      actorProfile.lastRepTarget = targetId;
      actorProfile.lastRepDate = nowDate;
      await actorProfile.save();

      // Confirm to user
      await interaction.reply({ 
        content: `You have successfully given ${amount > 0 ? 'positive' : 'negative'} reputation to ${targetMember.displayName}. Their new reputation is now ${targetProfile.reputation}.`,
        ephemeral: true
      });

      // Log the rep change to mod log channel
      const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
      if (logChannel)
      {
        logChannel.send({
          content: `${actorMember.displayName} (${actorId}) has given ${amount > 0 ? 'positive' : 'negative'} reputation to ${targetMember.displayName} (${targetId}). New reputation: ${targetProfile.reputation}.`
        });
      }
      else
      {
        console.warn('Mod log channel not found. Please set MOD_LOG_CHANNEL_ID in the config.');
      }

      // Rep reset
      if (sub === 'reset')
      {
        // Check for required role
        const userHasRequiredRole = interaction.member.roles.cache.some(role =>
          this.requiredRoles.includes(role.id)
        );

        if (!userHasRequiredRole) 
        {
          return interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true
          });
        }

        if (targetProfile.reputation === 0)
        {
          return interaction.reply({
            content: `${targetMember.displayName}'s reputation is already at 0.`,
            ephemeral: true
          });
        }

        const oldRep = targetProfile.reputation;
        targetProfile.reputation = 0;
        await targetProfile.save();

        await interaction.reply({
          content: `${targetMember.displayName}'s reputation has been reset from ${oldRep} to 0.`,
          ephemeral: true
        });

        const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
        if (logChannel)
        {
          logChannel.send({
            content: `${interaction.user.displayName} (${interaction.user.id}) has reset the reputation of ${targetMember.displayName} (${targetId}) from ${oldRep} to 0.`
          })
        }
        return;
      }
    }
    catch (err)
    {
      console.error(err);
      return interaction.reply({ ephemeral: true, content: 'An error occurred processing the rep command.' });
    }
  }
};
