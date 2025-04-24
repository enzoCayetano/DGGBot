// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
] });

// Create commands
client.commands = new Collection();
client.cooldowns = new Collection();

// Get subfolders path
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// For each folder in .commands
for (const folder of commandFolders)
{
	// Get commands '.js' from subfolders
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles)
	{
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command)
		{
			client.commands.set(command.data.name, command);
		}
		else
		{
			console.log(`Warning! The command at ${filePath} is missing a required "data" or "execute" property!`);
		}
	}
}

// Listen for slash commands
client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});

// Listen for prefix commands
client.on(Events.MessageCreate, message => {
	if (message.author.bot) return;

	const prefix = '.';

	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	console.log(message);
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);