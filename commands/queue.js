const { SlashCommandBuilder } = require('@discordjs/builders');
const { errorEmbed } = require('../utils/embeds');
const { queueEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue'),
  
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
      await interaction.reply({ 
        embeds: [queueEmbed(queue)]
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error displaying queue: ${error.message}`)]
      });
    }
  },
}; 