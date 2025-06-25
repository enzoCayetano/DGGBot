const { Events } = require('discord.js');

// Import Poll model to track active polls
const Poll = require('../models/Poll');

// Valid reaction emojis representing poll options 1-10
const numberEmojis =
[
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
];

module.exports =
{
  name: Events.MessageReactionRemove,

  async execute(reaction, user)
  {
    // Ignore bot reactions
    if (user.bot)
      return;

    // Fetch partial reaction if necessary
    try
    {
      if (reaction.partial)
        await reaction.fetch();
    }
    catch (err)
    {
      console.error('Error fetching partial reaction:', err);
      return;
    }

    const messageId = reaction.message.id;
    const emoji = reaction.emoji.name;

    // Ignore reactions not in the allowed emoji list
    if (!numberEmojis.includes(emoji))
      return;

    // Find the poll associated with this message
    const poll = await Poll.findOne({ messageId });
    if (!poll)
      return;

    // Find user's vote index in voters array
    const index = poll.voters.indexOf(user.id);

    // If user voted, remove their vote
    if (index > -1)
    {
      poll.voters.splice(index, 1);

      // Save updated poll
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
