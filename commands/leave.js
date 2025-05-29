const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the voice channel')
    .addIntegerOption(option =>
      option.setName('delay')
        .setDescription('Delay in seconds before leaving (0-300)')
        .setMinValue(0)
        .setMaxValue(300)
        .setRequired(false)),
  
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    const botVoiceChannel = interaction.guild.members.me.voice.channel;
    const delay = interaction.options.getInteger('delay') || 0;
    
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
    
    const leaveFunction = async () => {
      try {
        // Try to get the queue and stop it if it exists
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        
        if (queue) {
          console.log('Queue found, stopping...');
          await interaction.client.distube.stop(interaction.guildId);
        }
        
        // Get bot's voice connection
        const connection = interaction.guild.members.me.voice;
        
        if (connection.channel) {
          console.log('Disconnecting from voice channel...');
          await connection.disconnect();
        }
        
        // Also try DisTube's leave method as backup
        try {
          await interaction.client.distube.voices.leave(interaction.guildId);
        } catch (distubeError) {
          console.log('DisTube leave failed, but main disconnect succeeded');
        }
        
        return true;
      } catch (error) {
        console.error('Leave function error:', error);
        
        // Force disconnect as last resort
        try {
          const connection = interaction.guild.members.me.voice;
          if (connection.channel) {
            await connection.disconnect();
            return true;
          }
        } catch (forceError) {
          console.error('Force disconnect failed:', forceError);
          return false;
        }
      }
    };
    
    try {
      if (delay > 0) {
        // Leave with delay
        await interaction.reply({ 
          embeds: [infoEmbed(`${emojis.time} I will leave the voice channel in **${delay} seconds**...`)]
        });
        
        setTimeout(async () => {
          const success = await leaveFunction();
          
          if (success) {
            const embed = successEmbed(`${emojis.stop} Left the voice channel after ${delay} seconds!`);
            await interaction.followUp({ embeds: [embed] });
          } else {
            const embed = errorEmbed(`${emojis.error} Failed to leave the voice channel after delay.`);
            await interaction.followUp({ embeds: [embed] });
          }
        }, delay * 1000);
        
      } else {
        // Leave immediately
        const success = await leaveFunction();
        
        if (success) {
          await interaction.reply({ 
            embeds: [successEmbed(`${emojis.stop} Successfully left the voice channel!`)]
          });
        } else {
          await interaction.reply({ 
            embeds: [errorEmbed(`${emojis.error} Failed to leave the voice channel. Please try again.`)]
          });
        }
      }
      
    } catch (error) {
      console.error('Leave command error:', error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error leaving voice channel: ${error.message}`)]
      });
    }
  },
};