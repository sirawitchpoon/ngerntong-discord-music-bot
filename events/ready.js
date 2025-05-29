/**
 * Ready event handler
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Set bot activity
    client.user.setActivity('music commands', { type: ActivityType.Listening });
    
    console.log(`Bot is in ${client.guilds.cache.size} guilds`);
  },
}; 