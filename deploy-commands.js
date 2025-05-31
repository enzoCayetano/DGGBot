require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// load global vars
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.DEV_GUILD_ID;

const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const isDev = args.includes('--dev');

// check flags
if (isGlobal && isDev) {
	console.error('❌ You cannot deploy with both --global and --dev flags.');
	process.exit(1);
}

if (!isGlobal && !isDev) {
	console.warn('⚠️ No flag specified. Defaulting to --dev.');
}

// load the commands
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

// deploy commands
(async () => {
	try {
		console.log(`⏳ Started refreshing ${commands.length} application (/) commands.`);

		let route;
		if (isGlobal) {
			route = Routes.applicationCommands(clientId);
			console.log('🌐 Deploying commands globally...');
		} else {
			route = Routes.applicationGuildCommands(clientId, guildId);
			console.log(`🛠️ Deploying to development guild: ${guildId}`);
		}

		const data = await rest.put(route, { body: commands });

		console.log(`✅ Successfully deployed ${data.length} command(s).`);
	} catch (error) {
		console.error('❌ Deployment failed:', error);
	}
})();
