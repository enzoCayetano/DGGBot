const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pug')
        .setDescription('Start a pickup group and ping a role.')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to ping.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('players')
                .setDescription('Number of players needed (2-4)')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(4)),
        async execute(interaction)
        {
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.MentionEveryone))
            {
                await interaction.reply({
                    content: 'I lack permission to mention roles in this channel.',
                    ephemeral: true,
                });
            }

            const role = interaction.options.getRole('role');
            if (!role.mentionable)
            {
                await interaction.reply({
                    content: `The role ${role.name} is not mentionable.`,
                    ephemeral: true,
                })
            }

            let leaderId = interaction.user.id;
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const maxPlayers = interaction.options.getInteger('players');
            const group = new Set([leaderId]); 
            let isLocked = false;

            const joinButton = new ButtonBuilder()
                .setCustomId('join_pickup')
                .setLabel('Join')
                .setStyle(ButtonStyle.Success);

            const leaveButton = new ButtonBuilder()
                .setCustomId('leave_pickup')
                .setLabel('Leave')
                .setStyle(ButtonStyle.Danger);

            const lockButton = new ButtonBuilder()
                .setCustomId('lock_pickup')
                .setLabel('Lock Group')
                .setStyle(ButtonStyle.Primary);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_pickup')
                .setLabel('Cancel Group')
                .setStyle(ButtonStyle.Secondary);

            const embed = new EmbedBuilder()
                .setTitle('Pick Up Group')
                .setDescription(`${member.displayName} is forming a new pickup group! Looking for ${maxPlayers} players.
                    \n**Game:** ${role}
                    \n**Current Players (${group.size}/${maxPlayers}):**\n<@${[...group][0]}>`)
                .setColor('#00FF00')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(joinButton, leaveButton, lockButton, cancelButton);

            await interaction.reply({
                content: `<@&${role.id}> A new pickup group is starting!`,
                embeds: [embed],
                components: [row],
            });

            const message = await interaction.fetchReply();
            const collector = message.createMessageComponentCollector({ time: 24 * 60 * 60 * 1000 })

            collector.on('collect', async i => {
                if (isLocked)
                {
                    await i.reply({ content: 'This group is already locked!', ephemeral: true });
                    return;
                }

                try
                {
                    if (i.customId === 'join_pickup')
                    {
                        if (group.has(i.user.id))
                        {
                            await i.reply({ content: 'You are already in the group!', ephemeral: true })
                            return;
                        }
                        
                        if (group.size >= maxPlayers)
                        {
                            await i.reply({ content: 'The group is already full!', ephemeral: true });
                            return;
                        }
    
                        group.add(i.user.id);
                        const updatedEmbed = new EmbedBuilder()
                            .setTitle('Pick Up Group')
                            .setDescription(`A new pickup group is forming! Looking for ${maxPlayers} players.
                                \n**Role:** ${role.name}
                                \n**Current Players (${group.size}/${maxPlayers}):**
                                \n${[...group].map(id => `<@${id}>`).join('\n')}`)
                            .setColor('#00FF00')
                            .setTimestamp();
    
                        await i.update({ embeds: [updatedEmbed], components: [row] });
                    }
                    else if (i.customId === 'leave_pickup')
                    {
                        if (!group.has(i.user.id))
                        {
                            await i.reply({ content: 'You are not a part of this group!', ephemeral: true });
                            return;
                        }
    
                        if (i.user.id === leaderId && group.size === 1) 
                        {
                            await i.reply({ content: 'As the leader, you must cancel the group instead of leaving. Use the "Cancel Group" button.', ephemeral: true });
                            return;
                        }
    
                        group.delete(i.user.id);
                        if (i.user.id === leaderId && group.size > 0)
                        {
                            leaderId = [...group][0];
                            const newLeader = await interaction.guild.members.fetch(leaderId);
                            const updatedEmbed = new EmbedBuilder()
                                .setTitle('Pick Up Group')
                                .setDescription(`A new pickup group is forming! Looking for ${maxPlayers} players.
                                    \n**Game:** ${role.name}
                                    \n**Leader:** <@${leaderId}> (${newLeader.displayName})
                                    \n**Current Players (${group.size}/${maxPlayers}):**
                                    \n${[...group].map(id => `<@${id}>`).join('\n')}`)
                                .setColor('#00FF00')
                                .setTimestamp();
    
                            await i.update({ embeds: [updatedEmbed], components: [row] });
                        }
                        else
                        {
                            const updatedEmbed = new EmbedBuilder()
                            .setTitle('Pickup Group')
                            .setDescription(
                                group.size > 0
                                    ? `A new pickup group is forming! Looking for ${maxPlayers} players.
                                    \n**Role:** ${role.name}
                                    \n**Current Players (${group.size}/${maxPlayers}):**
                                    \n${[...group].map(id => `<@${id}>`).join('\n')}`
                                    : `A new pickup group is forming! Looking for ${maxPlayers} players.
                                    \n**Role:** ${role.name}
                                    \n**Current Players (0/${maxPlayers}):**
                                    \nNo players yet.`
                            )
                            .setColor('#00FF00')
                            .setTimestamp();
    
                            await i.update({ embeds: [updatedEmbed], components: [row] });
                        }
                    }
                    else if (i.customId === 'lock_pickup')
                    {
                        if (i.user.id !== leaderId)
                        {
                            await i.reply({ content: 'Only the group leader can lock the group!', ephemeral: true });
                            return;
                        }
    
                        isLocked = true;
                        collector.stop();
                        const finalEmbed = new EmbedBuilder()
                            .setTitle('Group Found!')
                            .setDescription(`The pickup group is complete!
                                \n**Game:** ${role.name}
                                \n**Players (${group.size}/${maxPlayers}):**
                                \n${[...group].map(id => `<@${id}>`).join('\n')}`)
                            .setColor('#0000FF')
                            .setTimestamp();
    
                        await i.message.edit({
                            content: `The pickup group is now locked!`,
                            embeds: [finalEmbed],
                            components: [],
                        })
                        await i.reply({ content: 'Group has been locked!', ephemeral: true });
                    }
                    else if (i.customId === 'cancel_pickup')
                    {
                        if (i.user.id !== leaderId)
                        {
                            await i.reply({ content: 'Only the group leader can cancel the group!', ephemeral: true });
                            return;
                        }
    
                        collector.stop();
                        const cancelEmbed = new EmbedBuilder()
                        .setTitle('Pickup Group Cancelled')
                        .setDescription('This pickup group has been cancelled by the leader.')
                        .setColor('#FF0000')
                        .setTimestamp();
    
                        await i.message.edit({
                            content: `The pickup group has been cancelled.`,
                            embeds: [cancelEmbed],
                            components: [],
                        });
                        await i.reply({ content: 'Group has been cancelled!', ephemeral: true });
                    }
                }
                catch (err)
                {
                    console.error('Error in button collector:', err);
                    await i.reply({
                        content: 'An error occurred while processing the pug command. Please try again.',
                        ephemeral: true,
                    });
                }
            });

            collector.on('end', async () => {
                if (!isLocked)
                {
                    const expiredEmbed = new EmbedBuilder()
                        .setTitle('Pickup Group Expired')
                        .setDescription('This pickup group has expired.')
                        .setColor('#FF0000')
                        .setTimestamp();

                    await message.edit({ embeds: [expiredEmbed], components: [] })
                }
            });
        },
};