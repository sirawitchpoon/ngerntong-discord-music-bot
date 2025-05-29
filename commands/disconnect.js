const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect the bot from the voice channel'),
  
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in a voice channel to use this command!`)], 
        ephemeral: true 
      });
    }
    
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    
    // Check if bot is connected
    if (!queue) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} I'm not connected to any voice channel!`)], 
        ephemeral: true 
      });
    }
    
    try {
      // Stop the queue and disconnect
      await interaction.client.distube.stop(interaction.guildId);
      await interaction.client.distube.voices.leave(interaction.guildId);
      
      await interaction.reply({ 
        embeds: [successEmbed(`${emojis.stop} Successfully disconnected from voice channel!`)]
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error disconnecting: ${error.message}`)]
      });
    }
  },
};