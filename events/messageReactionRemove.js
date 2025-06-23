const { Events } = require('discord.js');

// import active polls
const Poll = require('../models/Poll')

const numberEmojis = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
];

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user)
    {
        if (user.bot) return; 

        try
        {
            if (reaction.partial) await reaction.fetch();
        }
        catch(err)
        {
            console.error('Error fetching partial reaction:', err);
            return;
        }

        const messageId = reaction.message.id;
        const emoji = reaction.emoji.name;

        if (!numberEmojis.includes(emoji)) return;

        const poll = await Poll.findOne({ messageId });
        if (!poll) return;

        const index = poll.voters.indexOf(user.id);
        if (index > -1)
        {
            poll.voters.splice(index, 1);
            try
            {
                await poll.save();
            }
            catch (err)
            {
                console.error('Failed to save poll voters on removal:', err);
            }
        }
    }
};