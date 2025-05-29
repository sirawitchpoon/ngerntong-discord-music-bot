const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),
  
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    
    // Check if there's a queue
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} There is nothing playing right now!`)], 
        ephemeral: true 
      });
    }
    
    try {
      const song = queue.songs[0];
      const currentTime = queue.currentTime;
      const duration = song.duration;
      const progress = createProgressBar(currentTime, duration);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${emojis.play} Now Playing`)
        .setDescription(`[${song.name}](${song.url})`)
        .addFields(
          { name: 'Duration', value: `\`${formatTime(currentTime)} / ${song.formattedDuration}\``, inline: true },
          { name: 'Requested by', value: `${song.user}`, inline: true },
          { name: 'Progress', value: progress }
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Volume: ${queue.volume}% | Filter: ${queue.filters.names.join(', ') || 'Off'}` });
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error displaying current song: ${error.message}`)]
      });
    }
  },
};

/**
 * Create a progress bar for the song
 * @param {number} currentTime - Current time in seconds
 * @param {number} duration - Total duration in seconds
 * @returns {string} - Progress bar string
 */
function createProgressBar(currentTime, duration) {
  const progressBarLength = 15;
  const percentage = Math.round((currentTime / duration) * 100);
  const progress = Math.round((currentTime / duration) * progressBarLength);
  
  let progressBar = '';
  
  for (let i = 0; i < progressBarLength; i++) {
    if (i < progress) {
      progressBar += '▰'; // Filled part
    } else {
      progressBar += '▱'; // Empty part
    }
  }
  
  return `${emojis.time} \`${progressBar}\` ${percentage}%`;
}

/**
 * Format time in seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
} 