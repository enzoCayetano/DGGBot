const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'leaveMember',
    async execute(member)
    {
        const channelId = process.env.LEAVE_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;
        
        const embed = new EmbedBuilder()
            .setColor('#c922c3')
            .setTitle('Goodbye!')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`We're sad to see you go, ${member}. Thank you for being a part of Dead Girl Gaming!`)
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
}