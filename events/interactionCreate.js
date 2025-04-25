const { Collection, Events } = require('discord.js');
const Tag = require('../models/Tag');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// ---- HANDLE PREFIX COMMANDS ----
		if (message.author.bot || !message.content.startsWith('.')) return;

		// remove . prefix to retrieve tag name
		const tagName = message.content.slice(1).toLowerCase();

		try {
			const tag = await Tag.findOne({ name: tagName });
			if (!tag) {
				// tag not found
				return;
			}

			await message.channel.send(tag.description);
		} catch (err) {
			console.error('Error fetching tag:', err);
			await message.channel.send('❌ There was an error fetching that tag.');
		}

		// ---- HANDLE SLASH COMMANDS ----
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
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
				return interaction.reply({ content: `Please wait, this command has a cooldown of \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, epheremal: true });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}

		// ---- HANDLE MODALS ----
		if (interaction.customId === 'createTagModal')
		{
			const name = interaction.fields.getTextInputValue('tagName').toLowerCase();
			const description = interaction.fields.getTextInputValue('tagContent');

			try
			{
				// check if tag exists
				const existing = await Tag.findOne({ name });
				if (existing)
				{
					return await interaction.reply({ content: `❌ A tag with the name \`${name}\` already exists.`, ephemeral: true });
				}

				await Tag.create({
					name,
					description,
					createdBy: interaction.user.id,
				});

				await interaction.reply({ content: `✅ Tag \`${name}\` has been created!`, ephemeral: true });
			}
			catch (err)
			{
				console.error('Error creating tag:', err);
				await interaction.reply({ content: '❌ Failed to create tag. Please try again later.', ephemeral: true });
			}
		}
	},
};