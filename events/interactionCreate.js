const { Collection, Events } = require('discord.js');
const Tag = require('../models/Tag');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) 
  {
    // ---- HANDLE MODALS ----
    if (interaction.isModalSubmit()) 
    {
      if (interaction.customId === 'createTagModal') 
      {
        const name = interaction.fields.getTextInputValue('tagName').toLowerCase();
        const description = interaction.fields.getTextInputValue('tagContent');

        try 
        {
          const existing = await Tag.findOne({ name });
          if (existing) 
          {
            return await interaction.reply({
              content: `❌ A tag with the name \`${name}\` already exists.`,
              ephemeral: true,
            });
          }

          await Tag.create({
            name,
            description,
            type: 'simple',
            createdBy: interaction.user.id,
          });

          await interaction.reply({ content: `✅ Tag \`${name}\` has been created!`, ephemeral: true });
        } 
        catch (err) 
        {
          console.error('Error creating tag:', err);
          await interaction.reply({
            content: '❌ Failed to create tag. Please try again later.',
            ephemeral: true,
          });
        }
      }

      if (interaction.customId.startsWith('editTagModal:'))
      {
        const tagId = interaction.customId.split(':')[1];

        const tag = await Tag.findById(tagId);
        if (!tag)
        {
          return interaction.reply({
            content: 'Tag not found.',
            ephemeral: true,
          });
        }

        const newContent = interaction.fields.getTextInputValue('tagContent');

        tag.content = newContent;

        await tag.save();

        return interaction.reply({
          content: `✅ Tag \`${tag.name}\` has been updated.`,
          ephemeral: true,
        });
      }

      if (interaction.customId === 'sendMessageModal')
      {
        const messageContent = interaction.fields.getTextInputValue('sendMessageContent');

        await interaction.deferReply({ ephemeral: true, });
        await interaction.channel.send(messageContent);
        await interaction.editReply({ content: 'Message successfully sent. ' });
      }
    }

    // ---- HANDLE SLASH COMMANDS ----
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) 
      {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      // COOLDOWNS
      const { cooldowns } = interaction.client;

      if (!cooldowns.has(command.data.name))
        cooldowns.set(command.data.name, new Collection());

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3;
      const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

      if (timestamps.has(interaction.user.id)) 
      {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) 
        {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return interaction.reply({
            content: `Please wait, this command has a cooldown of \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try 
      {
        await command.execute(interaction);
      } 
      catch (error) 
      {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    }
  },
};
