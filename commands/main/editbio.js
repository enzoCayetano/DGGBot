const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  // Slash command setup with 'edit' and 'clear' subcommands
  data: new SlashCommandBuilder()
    .setName('bio')
    .setDescription('Edit your user bio.')
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit your biography.'))
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear your biography.')),

  async execute(interaction) 
  {
    const sub = interaction.options.getSubcommand();

    // Show modal for editing bio
    if (sub === 'edit')
    {
      const modal = new ModalBuilder()
        .setCustomId('editBioModal')
        .setTitle('Edit Biography');

      const messageInput = new TextInputBuilder()
        .setCustomId('editBioContent')
        .setLabel('What should your bio say?')
        .setPlaceholder('Write a short biography about yourself.')
        .setMaxLength(500)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(messageInput);

      modal.addComponents(row);

      await interaction.showModal(modal);
    }
    // Clear existing bio if it exists
    else if (sub === 'clear')
    {
      const profile = await Profile.findOne({ userId: interaction.user.id });

      if (!profile || !profile.bio)
      {
        return interaction.reply({
          content: 'You do not have a biography to clear.',
          ephemeral: true,
        });
      }

      profile.bio = 'No bio set.';
      await profile.save();

      return interaction.reply({
        content: 'Your biography has been cleared.',
        ephemeral: true,
      });
    }
  },
};
