const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Manage your Riokens!')
    .addSubcommand(sub =>
      sub.setName('balance')
        .setDescription('Check your current balance.')
    )
    .addSubcommand(sub =>
      sub.setName('deposit')
        .setDescription('Deposit Riokens into your bank.')
        .addIntegerOption(opt =>
          opt.setName('amount')
            .setDescription('Amount to deposit.')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('withdraw')
        .setDescription('Withdraw Riokens from your bank.')
        .addIntegerOption(opt =>
          opt.setName('amount')
            .setDescription('Amount to withdraw.')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('View your bank statistics and streaks.')
    ),
    async execute(interaction)
    {
      const sub = interaction.options.getSubcommand();
      const userId = interaction.user.id;

      const profile = await Profile.findOne({ userId });
      if (!profile) return interaction.reply('You do not have a profile yet. Please create one using `/createprofile`.');

      switch (sub)
      {
        case 'balance':
        {
          return interaction.reply(
            `Bank Total: **${profile.bankBalance}** Riokens\n` + 
            `Bank Level: Level ${profile.bankLevel}`
          );
        }

        case 'deposit':
        {
          const amount = interaction.options.getInteger('amount');
          if (amount <= 0 || amount > profile.points) return interaction.reply('Invalid amount!');

          profile.points -= amount;
          profile.bankBalance = (profile.bankBalance || 0) + amount;
          await profile.save();

          return interaction.reply(
            `Deposited **${amount}** Riokens into your bank!\n` + 
            `Bank Total: **${profile.bankBalance}** Riokens\n` + 
            `Bank Level: Level ${profile.bankLevel}`
          );
        }

        case 'withdraw':
        {
          const amount = interaction.options.getInteger('amount');
          if (amount <= 0 || amount > (profile.bank || 0)) return interaction.reply('Invalid amount!');

          profile.points += amount;
          profile.bank -= amount;
          await profile.save();

          return interaction.reply(
            `Withdrew **${amount}** Riokens from your bank!\n` + 
            `Bank Total: **${profile.bankBalance}** Riokens\n` + 
            `Balance: **${profile.points}`
          );
        }

        case 'stats':
        {
          return interaction.reply(
            '**Bank Stats:**\n' +
            `- Wallet: **${profile.points}** Riokens\n` +
            `- Bank: **${profile.bankBalance || 0}** Riokens\n` + 
            `- Daily Streak: **${profile.dailyStreak || 0}** day(s)`
          );
        }

        case 'default':
          return interaction.reply('Unknown subcommand.');
      }
    }
};