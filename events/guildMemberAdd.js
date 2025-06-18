const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member)
    {
        const channelId = process.env.WELCOME_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;
        
        const embed = new EmbedBuilder()
            .setColor('#8122c9')
            .setTitle('Welcome!')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`Welcome to Dead Girl Gaming, ${member}! Check out our https://discord.com/channels/1226974556636450856/1227383792554086420, https://discord.com/channels/1226974556636450856/1234254464718733323, and introduce yourself in the https://discord.com/channels/1226974556636450856/1227387874282963085 channel.`)
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};