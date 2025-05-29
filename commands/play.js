const { SlashCommandBuilder } = require('@discordjs/builders');
const { infoEmbed, errorEmbed, warningEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The song URL or search query')
        .setRequired(true)),
  
  async execute(interaction) {
    const query = interaction.options.getString('query');
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
    
    // Defer reply since playing music might take some time
    await interaction.deferReply();
    
    try {
      // Set textChannel for DisTube events
      const queue = interaction.client.distube.getQueue(interaction.guildId);
      if (!queue) {
        interaction.client.distube.voices.join(voiceChannel);
      }
      
      // Check if query is a YouTube URL that might be problematic
      const isYouTubeUrl = query.includes('youtube.com') || query.includes('youtu.be');
      
      if (isYouTubeUrl) {
        await interaction.editReply({ 
          embeds: [warningEmbed(`${emojis.warning} YouTube links may not work reliably on this server. Consider using Spotify links or search terms instead.`)]
        });
      } else {
        await interaction.editReply({ 
          embeds: [infoEmbed(`${emojis.search} Searching for: \`${query}\``)]
        });
      }
      
      // Try to play the song
      await interaction.client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        metadata: { interaction }
      });
      
    } catch (error) {
      console.error('Play command error:', error);
      
      let errorMessage = 'Error playing music';
      let suggestions = [];
      
      // Handle specific error types
      if (error.errorCode === 'YTDLP_ERROR' || error.message.includes('youtube')) {
        errorMessage = 'YouTube content unavailable';
        suggestions = [
          '• Try searching by song title instead of URL',
          '• Use Spotify or SoundCloud links',
          '• Search for: `artist - song title`'
        ];
      } else if (error.message.includes('Age')) {
        errorMessage = 'Age-restricted content';
        suggestions = [
          '• This video is age-restricted',
          '• Try a different version of the song'
        ];
      } else if (error.message.includes('Private')) {
        errorMessage = 'Private or unavailable content';
        suggestions = [
          '• This content is private or removed',
          '• Try searching for the song instead'
        ];
      } else if (error.message.includes('region')) {
        errorMessage = 'Content not available in this region';
        suggestions = [
          '• This content is geo-blocked',
          '• Try using Spotify or SoundCloud instead'
        ];
      } else {
        suggestions = [
          '• Check your search term',
          '• Try a different song',
          '• Use a direct Spotify/SoundCloud link'
        ];
      }
      
      const embed = errorEmbed(`${emojis.error} ${errorMessage}`)
        .addFields(
          { name: 'What you searched:', value: `\`${query}\``, inline: false },
          { name: 'Suggestions:', value: suggestions.join('\n'), inline: false }
        );
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};