const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing music and clear the queue'),
  
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
      // Try to get the queue
      const queue = interaction.client.distube.getQueue(interaction.guildId);
      
      if (queue) {
        // If queue exists, stop it properly
        console.log('Queue found, stopping music...');
        await interaction.client.distube.stop(interaction.guildId);
        
        await interaction.reply({ 
          embeds: [successEmbed(`${emojis.stop} Stopped playing music and cleared the queue!`)]
        });
      } else {
        // If no queue but bot is in voice channel, just inform user
        await interaction.reply({ 
          embeds: [successEmbed(`${emojis.info} No music is currently playing. Use \`/disconnect\` or \`/leave\` to make me leave the voice channel.`)]
        });
      }
      
    } catch (error) {
      console.error('Stop command error:', error);
      
      // Try alternative methods if DisTube stop fails
      try {
        // Try to pause and clear if stop doesn't work
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (queue) {
          if (!queue.paused) {
            queue.pause();
          }
          // Clear the queue manually
          queue.songs.splice(1);
          queue.skip();
        }
        
        await interaction.reply({ 
          embeds: [successEmbed(`${emojis.stop} Force stopped music and cleared queue!`)]
        });
        
      } catch (alternativeError) {
        console.error('Alternative stop method failed:', alternativeError);
        
        await interaction.reply({ 
          embeds: [errorEmbed(`${emojis.error} Error stopping music: ${error.message}\n\nTry using \`/disconnect\` to force leave the voice channel.`)]
        });
      }
    }
  },
};