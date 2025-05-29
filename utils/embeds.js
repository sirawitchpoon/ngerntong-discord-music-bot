/**
 * Embed utilities for the music bot
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const { EmbedBuilder } = require('discord.js');
const { emojis } = require('../config/emojis');

/**
 * Create a standard embed with consistent styling
 * @param {Object} options - Embed options
 * @returns {EmbedBuilder} - Configured embed
 */
exports.createEmbed = (options) => {
  const { 
    title, 
    description, 
    color = '#0099FF', 
    thumbnail = null, 
    fields = [], 
    footer = null,
    timestamp = true
  } = options;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title);
  
  if (description) embed.setDescription(description);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (fields.length > 0) embed.addFields(...fields);
  if (footer) embed.setFooter(footer);
  if (timestamp) embed.setTimestamp();
  
  return embed;
};

/**
 * Create an error embed
 * @param {string} message - Error message
 * @returns {EmbedBuilder} - Error embed
 */
exports.errorEmbed = (message) => {
  return exports.createEmbed({
    title: `${emojis.error} Error`,
    description: message,
    color: '#FF0000'
  });
};

/**
 * Create a success embed
 * @param {string} message - Success message
 * @returns {EmbedBuilder} - Success embed
 */
exports.successEmbed = (message) => {
  return exports.createEmbed({
    title: `${emojis.success} Success`,
    description: message,
    color: '#00FF00'
  });
};

/**
 * Create an info embed
 * @param {string} message - Info message
 * @returns {EmbedBuilder} - Info embed
 */
exports.infoEmbed = (message) => {
  return exports.createEmbed({
    title: `${emojis.info} Information`,
    description: message,
    color: '#0099FF'
  });
};

/**
 * Create a warning embed
 * @param {string} message - Warning message
 * @returns {EmbedBuilder} - Warning embed
 */
exports.warningEmbed = (message) => {
  return exports.createEmbed({
    title: `${emojis.warning} Warning`,
    description: message,
    color: '#FFFF00'
  });
};

/**
 * Create a queue embed
 * @param {Queue} queue - DisTube queue
 * @returns {EmbedBuilder} - Queue embed
 */
exports.queueEmbed = (queue) => {
  const songs = queue.songs;
  const currentSong = songs[0];
  
  // Format queue songs
  let queueString = '';
  const displayedSongs = songs.slice(1, 11); // Display up to 10 songs
  
  if (displayedSongs.length === 0) {
    queueString = 'No songs in queue';
  } else {
    queueString = displayedSongs.map((song, index) => 
      `**${index + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\` - Requested by: ${song.user}`
    ).join('\n');
    
    // Add message if there are more songs
    if (songs.length > 11) {
      queueString += `\n\n*...and ${songs.length - 11} more songs*`;
    }
  }
  
  // Create embed
  return exports.createEmbed({
    title: `${emojis.queue} Music Queue`,
    description: `**Now Playing:**\n[${currentSong.name}](${currentSong.url}) - \`${currentSong.formattedDuration}\` - Requested by: ${currentSong.user}\n\n**Up Next:**\n${queueString}`,
    color: '#9B59B6',
    fields: [
      { name: 'Total Songs', value: `${songs.length}`, inline: true },
      { name: 'Total Duration', value: `${queue.formattedDuration}`, inline: true },
      { name: 'Volume', value: `${queue.volume}%`, inline: true }
    ],
    footer: { text: `Loop: ${queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Song') : 'Off'} | Autoplay: ${queue.autoplay ? 'On' : 'Off'}` }
  });
}; 