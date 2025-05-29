const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue'),
  
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
    
    // Check if there's a queue
    if (!queue) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} There is nothing playing right now!`)], 
        ephemeral: true 
      });
    }
    
    // Check if there are enough songs to shuffle
    if (queue.songs.length < 3) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Need at least 3 songs in queue to shuffle!`)], 
        ephemeral: true 
      });
    }
    
    try {
      queue.shuffle();
      await interaction.reply({ 
        embeds: [successEmbed(`${emojis.shuffle} Queue has been shuffled!`)]
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error shuffling queue: ${error.message}`)]
      });
    }
  },
}; 