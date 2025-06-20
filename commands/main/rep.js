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
                    .setRequired(false))),
    async execute(interaction)
    {
        try
        {
            const sub = interaction.options.getSubcommand();
            const user = interaction.options.getUser('target') || interaction.user;
            const actorId = interaction.user.id;
            const targetId = user.id;
            const nowDate = new Date().toISOString().split('T')[0];
            const actorMember = await interaction.guild.members.fetch(interaction.userId);
            const targetMember = await interaction.guild.members.fetch(userId);

            // check if rep value exists
            const actorProfile = await Profile.findOneAndUpdate(
                { userId: actorId },
                { $setOnInsert: { rep: 0 } },
                { upsert: true, new: true }
            )
            const targetProfile = await Profile.findOneAndUpdate(
                { userId: targetId },
                { $setOnInsert: { rep: 0 } },
                { upsert: true, new: true }
            );

            if (actorProfile.lastRepDate !== nowDate)
            {
                actorProfile.repGivenToday = [];
                actorProfile.lastRepTarget = null;
                actorProfile.lastRepDate = nowDate;
            }

            if (sub === 'check')
            {
                await interaction.reply({ 
                    content: `${targetMember.displayName} has a reputation of \'${targetProfile.rep}.\'`,
                });
                return;
            }

            if (targetId === actorId)
            {
                return interaction.reply({ 
                    content: 'You cannot give reputation to yourself.',
                    ephemeral: true
                });
            }

            if (actorProfile.repGivenToday.includes(targetId))
            {
                return interaction.reply({ 
                    content: `You have already given reputation to ${targetMember.displayName} today.`,
                    ephemeral: true
                });
            }

            if (actorProfile.lastRepTarget === targetId)
            {
                return interaction.reply({ 
                    content: `You have already given reputation to ${targetMember.displayName} today.`,
                    ephemeral: true
                });
            }

            if (actorProfile.repGivenToday.length >= 5)
            {
                return interaction.reply({ 
                    content: 'You have reached the maximum number of users you can rep today.',
                    ephemeral: true
                });
            }

            const amount = (sub === 'up') ? 1 : -1;
            const newRep = targetProfile.rep + amount;

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

            targetProfile.rep = newRep;
            await targetProfile.save();

            actorProfile.repGivenToday.push(targetId);
            actorProfile.lastRepTarget = targetId;
            actorProfile.lastRepDate = nowDate;
            await actorProfile.save();

            await interaction.reply({ 
                content: `You have successfully given ${amount > 0 ? 'positive' : 'negative'} reputation to ${targetMember.displayName}. Their new reputation is now ${targetProfile.rep}.`,
                ephemeral: true
            });

            // log the reputation change
            const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            if (logChannel)
            {
                logChannel.send({
                    content: `${actorMember.displayName} (${actorId}) has given ${amount > 0 ? 'positive' : 'negative'} reputation to ${targetMember.displayName} (${targetId}). New reputation: ${targetProfile.rep}.`
                });
            }
            else
            {
                console.warn('Mod log channel not found. Please set MOD_LOG_CHANNEL_ID in the config.');
            }
        }
        catch (err)
        {
            console.error(err);
            return interaction.editReply({ ephemeral: true, content: 'An error occurred processing the rep command.' });
        }
    }
};