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
  name: Events.MessageReactionAdd,

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

    // Check if user has already voted in this poll
    if (poll.voters.includes(user.id))
    {
      try
      {
        // Remove duplicate vote reaction
        await reaction.users.remove(user.id);
      }
      catch (error)
      {
        console.error('Failed to remove duplicate vote:', error);
      }

      return; // Early return to prevent adding duplicate voter
    }

    // Register the user's vote
    poll.voters.push(user.id);

    // Save the updated poll voters list
    try
    {
      await poll.save();
    }
    catch (err)
    {
      console.error('Failed to save poll voters:', err);
    }
  }
};
