const { Collection, Events } = require('discord.js');
const Tag = require('../models/Tag');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// ---- HANDLE MODALS ----
		if (interaction.isModalSubmit())
		{
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
						return await interaction.reply({ 
							content: `❌ A tag with the name \`${name}\` already exists.`, 
							ephemeral: true,
						});
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
					await interaction.reply({ 
						content: '❌ Failed to create tag. Please try again later.', 
						ephemeral: true,
					});
				}
			}

			if (interaction.customId === 'createTagModalAdvanced') 
			{
				try {
					const name = interaction.fields.getTextInputValue('tagName').toLowerCase();
					const content = interaction.fields.getTextInputValue('tagContent');
					const embedTitle = interaction.fields.getTextInputValue('embedTitle') || null;
					const embedColor = interaction.fields.getTextInputValue('embedColor') || null;
					const footer = interaction.fields.getTextInputValue('embedFooter') || null;
			
					// check if tag exists
					const existing = await Tag.findOne({ name });
					if (existing) {
						return await interaction.reply({ 
							content: `❌ A tag with the name \`${name}\` already exists.`, 
							ephemeral: true 
						});
					}
			
					// Store tag with embed info
					await Tag.create({ 
						name, 
						description: content,
						embed: {
							title: embedTitle,
							color: embedColor,
							footer: footer
						}
					});
			
					await interaction.reply({ 
						content: `🎨 Advanced tag \`${name}\` created with embed options.`, 
						ephemeral: true 
					});
				}
				catch (err) {
					console.error('Error creating advanced tag:', err);
					await interaction.reply({ 
						content: '❌ Failed to create advanced tag. Please try again later.', 
						ephemeral: true 
					});
				}
			}
		}

		// ---- HANDLE SLASH COMMANDS ----
		if (interaction.isCommand())
		{
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

		// handle role restrictions
		const requiredRoles = command.requiredRoles || [];
		if (requiredRoles.length > 0)
		{
			const hasRequiredRole = interaction.member.roles.cache.some(role =>
				requiredRoles.includes(role.id)
			);

			if (!hasRequiredRole)
			{
				return interaction.reply({
					content: '❌ Sorry, you don’t have permission to use this command.',
					ephemeral: true,
				});
			}
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
	
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
	},
};