const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        .setRequired(true)),
    async execute(interaction)
    {
        const rawTitle = interaction.options.getString('title');
        const title = rawTitle.length > 20 ? rawTitle.substring(0, 20) + '...' : rawTitle; // clamp title length to 20 characters

        const question = interaction.options.getString('question');
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