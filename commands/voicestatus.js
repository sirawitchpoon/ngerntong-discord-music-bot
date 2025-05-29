const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { emojis } = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicestatus')
    .setDescription('Check bot voice connection status (for debugging)'),
  
  async execute(interaction) {
    const userVoiceChannel = interaction.member.voice.channel;
    const botVoiceChannel = interaction.guild.members.me.voice.channel;
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const voiceConnection = interaction.client.distube.voices.get(interaction.guildId);
    
    // Collect voice status information
    const statusInfo = {
      userInVoice: userVoiceChannel ? true : false,
      userChannelName: userVoiceChannel ? userVoiceChannel.name : 'None',
      userChannelId: userVoiceChannel ? userVoiceChannel.id : 'None',
      
      botInVoice: botVoiceChannel ? true : false,
      botChannelName: botVoiceChannel ? botVoiceChannel.name : 'None',
      botChannelId: botVoiceChannel ? botVoiceChannel.id : 'None',
      
      queueExists: queue ? true : false,
      queueLength: queue ? queue.songs.length : 0,
      isPlaying: queue ? !queue.paused : false,
      
      voiceConnectionExists: voiceConnection ? true : false,
      sameChannel: (userVoiceChannel && botVoiceChannel) ? userVoiceChannel.id === botVoiceChannel.id : false
    };
    
    // Create status embed
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`${emojis.info} Voice Connection Status`)
      .setDescription('Current voice connection and queue status')
      .addFields(
        {
          name: `${emojis.person} User Status`,
          value: `In Voice: ${statusInfo.userInVoice ? '✅' : '❌'}\nChannel: ${statusInfo.userChannelName}\nID: \`${statusInfo.userChannelId}\``,
          inline: true
        },
        {
          name: `${emojis.bot} Bot Status`, 
          value: `In Voice: ${statusInfo.botInVoice ? '✅' : '❌'}\nChannel: ${statusInfo.botChannelName}\nID: \`${statusInfo.botChannelId}\``,
          inline: true
        },
        {
          name: `${emojis.music} Queue Status`,
          value: `Queue Exists: ${statusInfo.queueExists ? '✅' : '❌'}\nSongs: ${statusInfo.queueLength}\nPlaying: ${statusInfo.isPlaying ? '✅' : '❌'}`,
          inline: true
        },
        {
          name: `${emojis.settings} Connection Status`,
          value: `Voice Connection: ${statusInfo.voiceConnectionExists ? '✅' : '❌'}\nSame Channel: ${statusInfo.sameChannel ? '✅' : '❌'}`,
          inline: false
        }
      )
      .setFooter({ 
        text: `Guild ID: ${interaction.guildId}`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();
    
    // Add troubleshooting tips
    if (!statusInfo.botInVoice) {
      embed.addFields({
        name: `${emojis.warning} Issue Detected`,
        value: 'Bot is not in any voice channel. Use `/play` command to connect.',
        inline: false
      });
    } else if (!statusInfo.sameChannel) {
      embed.addFields({
        name: `${emojis.warning} Issue Detected`, 
        value: 'You and the bot are in different voice channels.',
        inline: false
      });
    } else if (!statusInfo.queueExists && statusInfo.botInVoice) {
      embed.addFields({
        name: `${emojis.warning} Possible Issue`,
        value: 'Bot is in voice channel but no queue exists. This might cause disconnect commands to fail.',
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};