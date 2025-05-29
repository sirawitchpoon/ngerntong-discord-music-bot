const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode for the queue')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' }
        )),
  
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
    
    const mode = interaction.options.getString('mode');
    let loopMode = 0;
    let modeText = 'Off';
    let modeEmoji = emojis.stop;
    
    switch (mode) {
      case 'off':
        loopMode = 0;
        modeText = 'Off';
        modeEmoji = emojis.stop;
        break;
      case 'song':
        loopMode = 1;
        modeText = 'Song';
        modeEmoji = emojis.repeatOne;
        break;
      case 'queue':
        loopMode = 2;
        modeText = 'Queue';
        modeEmoji = emojis.repeat;
        break;
    }
    
    try {
      queue.setRepeatMode(loopMode);
      await interaction.reply({ 
        embeds: [successEmbed(`${modeEmoji} Loop mode set to: **${modeText}**`)]
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error setting loop mode: ${error.message}`)]
      });
    }
  },
}; 