const { Events } = require('discord.js');

// import active polls
const Poll = require('../models/Poll')

const numberEmojis = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
];

module.exports = {
    name: Events.MessageReactionAdd,
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
        }

        const messageId = reaction.message.id;
        const emoji = reaction.emoji.name;

        if (!numberEmojis.includes(emoji)) return;

        const poll = activePolls.get(messageId);
        if (!poll) return;

        // check if user already voted
        if (poll.voters.includes(user.id)) 
        {
            try
            {
                await reaction.users.remove(user.id);
            }
            catch (error) 
            {
                console.error('Failed to remove duplicate vote:', error);
            }
        }

        poll.voters.push(user.id);
        await poll.save();
    }
};