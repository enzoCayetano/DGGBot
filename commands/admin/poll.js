const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Poll = require('../../models/Poll');

const numberEmojis = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with options.')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('The title of the poll.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The question for the poll.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Comma-separated list of options for the poll.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration for the poll in minutes (e.gg, 10m, 1h, 2d).')
        .setRequired(true)),
    requiredRoles: ['1237571670261371011', '1275018612922384455'],
    async execute(interaction)
    {
        // check if user has permission to create a poll
        const userHasRequiredRole = interaction.member.roles.cache.some(role =>
            this.requiredRoles.includes(role.id)
        );

        if (!userHasRequiredRole) 
        {
        return interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true,
        });
        }

        const rawTitle = interaction.options.getString('title');
        const title = rawTitle.length > 20 ? rawTitle.substring(0, 20) + '...' : rawTitle; // clamp title length to 20 characters
        const question = interaction.options.getString('question');
        const durationInput = interaction.options.getString('duration');
        const durationMs = parseDuration(durationInput);

        if (!durationMs || durationMs < 5000 || durationMs > 7 * 24 * 60 * 60 * 1000)
        {
            return interaction.reply({
                content: 'Invalid duration. Use something like `10m`, `1h`, `2d` (between 5s and 7d).',
                ephemeral: true,
            })
        }

        const options = interaction.options.getString('options')
            .split(',')
            .map(option => option.trim())
            .filter(option => option.length > 0);
    
        if (options.length < 2 || options.length > 10) 
        {
            return interaction.reply({
            content: 'You must provide between 2 and 10 options for the poll, separated by commas.',
            ephemeral: true,
            });
        }
    
        const embed = new EmbedBuilder()
            .setColor('#8122c9')
            .setTitle(`Poll: ${title}`)
            .setDescription(question)
            .addFields(
                options.map((option, index) => ({
                    name: `${numberEmojis[index]} Option ${index + 1}`,
                    value: option,
                    inline: false
                }))
            )
            .setTimestamp()
            .setFooter({ text: `Poll created by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        try
        {
            const pollMessage = await interaction.reply({
                embeds: [embed],
                fetchReply: true,
            });

            for (let i = 0; i < options.length; i++) 
            {
                await pollMessage.react(numberEmojis[i]);
            }

            const poll = new Poll({
                messageId: pollMessage.id,
                channelId: interaction.channel.id,
                guildId: interaction.guild.id,
                creatorId: interaction.user.id,
                title,
                question,
                options,
                voters: [],
                endsAt: new Date(Date.now() + durationMs),
            });

            await poll.save();

            setTimeout(async () => {
                try
                {
                    const storedPoll = await Poll.findOne({ messageId: pollMessage.id });
                    if (!storedPoll) return;

                    const message = await interaction.channel.messages.fetch(storedPoll.messageId);
                    
                    for (let i = 0; i < storedPoll.options.length; i++)
                    {
                        const emoji = numberEmojis[i];
                        const reaction = message.reactions.cache.get(emoji);
                        if (reaction)
                        {
                            await reaction.fetch();
                        }
                    }

                    const results = [];

                    for (let i = 0; i < storedPoll.options.length; i++)
                    {
                        const emoji = numberEmojis[i];
                        const reaction = message.reactions.cache.get(emoji);
                        let count = 0;

                        if (reaction)
                        {
                            count = reaction.count;

                            const botReacted = reaction.users.cache.has(interaction.client.user.id);
                            if (botReacted)
                            {
                                count--;
                            }
                        }

                        results.push({
                            option: storedPoll.options[i],
                            votes: count > 0 ? count : 0,
                        });
                    }

                        results.sort((a, b) => b.votes - a.votes);

                        const resultEmbed = new EmbedBuilder()
                            .setTitle(`Poll Results: ${storedPoll.title}`)
                            .setDescription(storedPoll.question)
                            .setColor('#c922c3')
                            .addFields(
                                results.map(r => ({
                                    name: r.option,
                                    value: `${r.votes} vote${r.votes !== 1 ? 's' : ''}`,
                                    inline: false,
                                }))
                            )
                            .setTimestamp();

                        await interaction.channel.send({ embeds: [resultEmbed] })

                        await storedPoll.deleteOne();
                    }
                    catch (err)
                    {
                        console.error('Failed to end poll:', err);
                    }
            }, durationMs);
        }
        catch (error) 
        {
            console.error('Error creating poll:', error);
            return interaction.reply({
                content: 'There was an error creating the poll. Please try again later.',
                ephemeral: true,
            });
        }
    }
};

function parseDuration(input)
{
    const match = input.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    const unitToMs = {
        's': 1000,
        'm': 1000 * 60,
        'h': 1000 * 60 * 60,
        'd': 1000 * 60 * 60 * 24
    };

    return value * unitToMs[unit];
}