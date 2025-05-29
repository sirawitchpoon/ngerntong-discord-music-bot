const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect the bot from the voice channel'),
  
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    const botVoiceChannel = interaction.guild.members.me.voice.channel;
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in a voice channel to use this command!`)], 
        ephemeral: true 
      });
    }
    
    // Check if bot is in a voice channel
    if (!botVoiceChannel) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} I'm not connected to any voice channel!`)], 
        ephemeral: true 
      });
    }
    
    // Check if user and bot are in the same voice channel
    if (voiceChannel.id !== botVoiceChannel.id) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in the same voice channel as me!`)], 
        ephemeral: true 
      });
    }
    
    try {
      // Try to get the queue first (it might not exist)
      const queue = interaction.client.distube.getQueue(interaction.guildId);
      
      if (queue) {
        // If queue exists, stop it properly
        await interaction.client.distube.stop(interaction.guildId);
      }
      
      // Force disconnect from voice channel
      const connection = interaction.guild.members.me.voice;
      if (connection.channel) {
        await connection.disconnect();
      }
      
      // Also try DisTube's leave method
      try {
        await interaction.client.distube.voices.leave(interaction.guildId);
      } catch (leaveError) {
        console.log('DisTube leave method failed, but connection already handled');
      }
      
      await interaction.reply({ 
        embeds: [successEmbed(`${emojis.stop} Successfully disconnected from voice channel!`)]
      });
      
    } catch (error) {
      console.error('Disconnect error:', error);
      
      // Try force disconnect even if DisTube fails
      try {
        const connection = interaction.guild.members.me.voice;
        if (connection.channel) {
          await connection.disconnect();
          return interaction.reply({ 
            embeds: [successEmbed(`${emojis.stop} Force disconnected from voice channel!`)]
          });
        }
      } catch (forceError) {
        console.error('Force disconnect also failed:', forceError);
      }
      
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error disconnecting: ${error.message}`)]
      });
    }
  },
};