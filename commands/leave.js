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
    const delay = interaction.options.getInteger('delay') || 0;
    
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
      if (delay > 0) {
        // Leave with delay
        await interaction.reply({ 
          embeds: [infoEmbed(`${emojis.time} I will leave the voice channel in **${delay} seconds**...`)]
        });
        
        setTimeout(async () => {
          try {
            await interaction.client.distube.stop(interaction.guildId);
            await interaction.client.distube.voices.leave(interaction.guildId);
            
            const embed = successEmbed(`${emojis.stop} Left the voice channel!`);
            await interaction.followUp({ embeds: [embed] });
          } catch (error) {
            console.error('Error in delayed leave:', error);
            const embed = errorEmbed(`${emojis.error} Error leaving: ${error.message}`);
            await interaction.followUp({ embeds: [embed] });
          }
        }, delay * 1000);
        
      } else {
        // Leave immediately
        await interaction.client.distube.stop(interaction.guildId);
        await interaction.client.distube.voices.leave(interaction.guildId);
        
        await interaction.reply({ 
          embeds: [successEmbed(`${emojis.stop} Successfully left the voice channel!`)]
        });
      }
      
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error leaving voice channel: ${error.message}`)]
      });
    }
  },
};