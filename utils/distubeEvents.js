/**
 * DisTube events handler with improved error handling
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const { EmbedBuilder } = require('discord.js');
const { emojis } = require('../config/emojis');

/**
 * Handles all DisTube events
 * @param {Client} client - Discord client
 */
exports.handleDistubeEvents = (client) => {
  const distube = client.distube;
  
  // When a song starts playing
  distube.on('playSong', (queue, song) => {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`${emojis.play} Now Playing`)
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: 'Duration', value: `${song.formattedDuration}`, inline: true },
        { name: 'Requested by', value: `${song.user}`, inline: true }
      )
      .setThumbnail(song.thumbnail)
      .setFooter({ text: `Volume: ${queue.volume}% | Filter: ${queue.filters.names.join(', ') || 'Off'}` });
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending playSong message:', error);
    }
  });

  // When a song is added to the queue
  distube.on('addSong', (queue, song) => {
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`${emojis.success} Added to Queue`)
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: 'Duration', value: `${song.formattedDuration}`, inline: true },
        { name: 'Requested by', value: `${song.user}`, inline: true },
        { name: 'Position in queue', value: `${queue.songs.length - 1}`, inline: true }
      )
      .setThumbnail(song.thumbnail);
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending addSong message:', error);
    }
  });

  // When a playlist is added to the queue
  distube.on('addList', (queue, playlist) => {
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`${emojis.playlist} Playlist Added`)
      .setDescription(`[${playlist.name}](${playlist.url})`)
      .addFields(
        { name: 'Songs added', value: `${playlist.songs.length}`, inline: true },
        { name: 'Requested by', value: `${playlist.user}`, inline: true }
      )
      .setThumbnail(playlist.thumbnail);
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending addList message:', error);
    }
  });

  // When an error occurs - IMPROVED ERROR HANDLING
  distube.on('error', (channel, error) => {
    console.error('DisTube Error:', error);
    
    if (!channel || !channel.send) {
      console.error('No valid channel to send error message');
      return;
    }
    
    let errorMessage = 'An unknown error occurred';
    let userFriendlyMessage = '';
    
    // Handle specific error types
    if (error.errorCode === 'YTDLP_ERROR') {
      errorMessage = 'YouTube content error';
      userFriendlyMessage = 'This YouTube video is not available. Please try a different song or search term.';
    } else if (error.message.includes('Sign in to confirm your age')) {
      errorMessage = 'Age-restricted content';
      userFriendlyMessage = 'This video is age-restricted and cannot be played.';
    } else if (error.message.includes('Private video')) {
      errorMessage = 'Private video';
      userFriendlyMessage = 'This video is private and cannot be played.';
    } else if (error.message.includes('Video unavailable')) {
      errorMessage = 'Video unavailable';
      userFriendlyMessage = 'This video is not available in this region.';
    } else if (error.message.includes('No voice connection')) {
      errorMessage = 'No voice connection';
      userFriendlyMessage = 'I need to be connected to a voice channel to play music.';
    } else {
      userFriendlyMessage = `Error: ${error.message.slice(0, 100)}...`;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`${emojis.error} ${errorMessage}`)
      .setDescription(userFriendlyMessage)
      .addFields(
        { name: 'Suggestions', value: '• Try a different search term\n• Use a direct YouTube URL\n• Try playing from Spotify or SoundCloud' }
      )
      .setFooter({ text: 'If this problem persists, please contact support' });
    
    try {
      channel.send({ embeds: [embed] });
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  });

  // When the queue ends - AUTO DISCONNECT
  distube.on('finish', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle(`${emojis.info} Queue Finished`)
      .setDescription('No more songs in the queue. Disconnecting from voice channel...');
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending finish message:', error);
    }
    
    // Auto disconnect after 5 seconds
    setTimeout(() => {
      try {
        distube.voices.leave(queue.id);
        console.log(`Auto disconnected from guild: ${queue.id}`);
      } catch (error) {
        console.error('Error auto disconnecting:', error);
      }
    }, 5000);
  });

  // When the bot disconnects from a voice channel
  distube.on('disconnect', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle(`${emojis.info} Disconnected`)
      .setDescription('I have been disconnected from the voice channel.');
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending disconnect message:', error);
    }
  });

  // When the queue is empty - ALSO AUTO DISCONNECT
  distube.on('empty', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle(`${emojis.warning} Channel Empty`)
      .setDescription('Voice channel is empty! Leaving the channel in 30 seconds...');
    
    try {
      queue.textChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending empty message:', error);
    }
    
    // Auto disconnect after 30 seconds of empty channel
    setTimeout(() => {
      try {
        const currentQueue = distube.getQueue(queue.id);
        if (currentQueue) {
          distube.voices.leave(queue.id);
          console.log(`Auto disconnected from empty channel: ${queue.id}`);
        }
      } catch (error) {
        console.error('Error auto disconnecting from empty channel:', error);
      }
    }, 30000);
  });

  // Handle search errors
  distube.on('searchNoResult', (message, query) => {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`${emojis.error} No Results Found`)
      .setDescription(`No search results found for: \`${query}\``)
      .addFields(
        { name: 'Suggestions', value: '• Check your spelling\n• Try different keywords\n• Use a direct URL instead' }
      );
    
    try {
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending searchNoResult message:', error);
    }
  });

  // Handle invalid URL
  distube.on('searchInvalidAnswer', (message) => {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`${emojis.error} Invalid Selection`)
      .setDescription('Please select a valid number from the search results.');
    
    try {
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending searchInvalidAnswer message:', error);
    }
  });
};