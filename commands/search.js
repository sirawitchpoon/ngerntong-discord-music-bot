const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed, infoEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for songs and select one to play')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Search query for the song')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('source')
        .setDescription('Search source')
        .setRequired(false)
        .addChoices(
          { name: 'YouTube', value: 'youtube' },
          { name: 'Spotify', value: 'spotify' },
          { name: 'SoundCloud', value: 'soundcloud' }
        )),
  
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const source = interaction.options.getString('source') || 'youtube';
    const voiceChannel = interaction.member.voice.channel;
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in a voice channel to use this command!`)], 
        ephemeral: true 
      });
    }
    
    // Check bot permissions
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({ 
        embeds: [errorEmbed(`${emojis.error} I need permissions to join and speak in your voice channel!`)], 
        ephemeral: true 
      });
    }
    
    await interaction.deferReply();
    
    try {
      // Create search embed
      const searchEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`${emojis.search} Searching...`)
        .setDescription(`Searching for: \`${query}\`\nSource: \`${source.toUpperCase()}\``)
        .addFields(
          { name: 'Alternative Search Tips', value: 
            '• Try different keywords\n' +
            '• Use artist name + song title\n' +
            '• Try different sources (Spotify/SoundCloud)\n' +
            '• Use direct URLs when possible'
          }
        );
      
      await interaction.editReply({ embeds: [searchEmbed] });
      
      // Construct search query based on source
      let searchQuery = query;
      switch (source) {
        case 'spotify':
          searchQuery = `spotify:${query}`;
          break;
        case 'soundcloud':
          searchQuery = `soundcloud:${query}`;
          break;
        case 'youtube':
        default:
          searchQuery = `ytsearch:${query}`;
          break;
      }
      
      // Try to play directly (simplified approach)
      await interaction.client.distube.play(voiceChannel, searchQuery, {
        member: interaction.member,
        textChannel: interaction.channel,
        metadata: { interaction }
      });
      
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${emojis.success} Search Successful`)
        .setDescription(`Added to queue: \`${query}\``)
        .addFields(
          { name: 'Source', value: source.toUpperCase(), inline: true },
          { name: 'Requested by', value: `${interaction.member}`, inline: true }
        );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
    } catch (error) {
      console.error('Search command error:', error);
      
      const fallbackEmbed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle(`${emojis.warning} Search Failed`)
        .setDescription(`Could not find or play: \`${query}\``)
        .addFields(
          { name: 'Error Details', value: error.message.slice(0, 1000) },
          { name: 'Alternative Solutions', value: 
            '• Try using `/play` command with direct URL\n' +
            '• Search on Spotify/SoundCloud and copy link\n' +
            '• Try different search terms\n' +
            '• Contact support if issue persists'
          }
        )
        .setFooter({ text: 'Use /help for more information' });
      
      await interaction.editReply({ embeds: [fallbackEmbed] });
    }
  },
};