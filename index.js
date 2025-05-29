/**
 * Discord DisTube Music Bot - v5 Compatible
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { emojis } = require('./config/emojis');

// Check for required environment variables
if (!process.env.TOKEN) {
  console.error('❌ ERROR: TOKEN environment variable is not set!');
  console.error('Please set TOKEN in your environment variables.');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error('❌ ERROR: CLIENT_ID environment variable is not set!');
  console.error('Please set CLIENT_ID in your environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`📊 TOKEN: ${process.env.TOKEN ? 'Set' : 'Not Set'}`);
console.log(`📊 CLIENT_ID: ${process.env.CLIENT_ID ? 'Set' : 'Not Set'}`);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create collections for commands
client.commands = new Collection();

// Initialize DisTube v5 with improved configuration
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  emitAddSongWhenCreatingQueue: false,
  nsfw: false,
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: false
    }),
    new SoundCloudPlugin()
  ],
  ytdlOptions: {
    highWaterMark: 1 << 25,
    quality: 'highestaudio',
    format: 'audioonly',
    liveBuffer: 40000,
    dlChunkSize: 1024,
    bitrate: 128
  },
  customFilters: {
    // Add custom audio filters
    bassboost: 'bass=g=10',
    earrape: 'bass=g=50',
    nightcore: 'aresample=48000,asetrate=48000*1.25',
    vaporwave: 'aresample=48000,asetrate=48000*0.8'
  },
  // DisTube v5 specific options
  searchCooldown: 30,
  emptyCooldown: 30,
  savePreviousSongs: true
});

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️  [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Deploy slash commands
const deployCommands = async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
    
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.TOKEN);
    
    // The put method is used to fully refresh all commands globally
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    
    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    
    // More specific error messages
    if (error.message.includes('token')) {
      console.error('🔑 Token-related error. Please check your TOKEN environment variable.');
    }
    if (error.message.includes('client')) {
      console.error('🆔 Client ID-related error. Please check your CLIENT_ID environment variable.');
    }
    
    throw error; // Re-throw to prevent login
  }
};

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
    console.log(`✅ Loaded event (once): ${event.name}`);
  } else {
    client.on(event.name, (...args) => event.execute(...args));
    console.log(`✅ Loaded event: ${event.name}`);
  }
}

// DisTube events with improved error handling
const { handleDistubeEvents } = require('./utils/distubeEvents');
handleDistubeEvents(client);

// Start Health Check Server (for Render)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Discord Music Bot is running!',
        timestamp: new Date().toISOString(),
        versions: {
          node: process.version,
          distube: '5.0.0',
          discordjs: '14.14.1'
        },
        bot: client.isReady() ? {
            ready: client.isReady(),
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            uptime: client.uptime
        } : { ready: false }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Deploy commands and then log in to Discord
(async () => {
  try {
    await deployCommands();
    console.log('🔄 Logging in to Discord...');
    await client.login(process.env.TOKEN);
    console.log('✅ Bot started successfully!');
    console.log(`🎵 DisTube v5 initialized with ${client.distube.plugins.length} plugins`);
    
    // Make client globally available for health check
    global.botClient = client;
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
})();