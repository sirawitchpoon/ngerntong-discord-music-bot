/**
 * DisTube events handler
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
    
    queue.textChannel.send({ embeds: [embed] });
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
    
    queue.textChannel.send({ embeds: [embed] });
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
    
    queue.textChannel.send({ embeds: [embed] });
  });

  // When an error occurs
  distube.on('error', (channel, error) => {
    console.error(error);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${emojis.error} Error`)
        .setDescription(`An error occurred: ${error.message.slice(0, 1997)}...`);
      
      channel.send({ embeds: [embed] });
    }
  });

  // When the queue ends
  distube.on('finish', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle(`${emojis.info} Queue Finished`)
      .setDescription('No more songs in the queue.');
    
    queue.textChannel.send({ embeds: [embed] });
  });

  // When the bot disconnects from a voice channel
  distube.on('disconnect', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle(`${emojis.info} Disconnected`)
      .setDescription('I have been disconnected from the voice channel.');
    
    queue.textChannel.send({ embeds: [embed] });
  });

  // When the queue is empty
  distube.on('empty', (queue) => {
    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle(`${emojis.warning} Channel Empty`)
      .setDescription('Voice channel is empty! Leaving the channel...');
    
    queue.textChannel.send({ embeds: [embed] });
  });
}; 