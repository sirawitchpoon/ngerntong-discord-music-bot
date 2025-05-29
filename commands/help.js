const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emojis } = require('../config/emojis');

const commandCategories = {
  playback: {
    title: `${emojis.play} Playback Controls`,
    description: 'Commands to control music playback.',
    commands: [
      { name: '/play <song>', description: 'Play a song or playlist', example: '/play Despacito' },
      { name: '/pause', description: 'Pause the current song', example: '/pause' },
      { name: '/resume', description: 'Resume playback', example: '/resume' },
      { name: '/skip', description: 'Skip to the next song', example: '/skip' },
      { name: '/stop', description: 'Stop and clear the queue', example: '/stop' }
    ]
  },
  queue: {
    title: `${emojis.queue} Queue Management`,
    description: 'Commands to manage the music queue.',
    commands: [
      { name: '/queue', description: 'View the current queue', example: '/queue' },
      { name: '/nowplaying', description: 'Show current song details', example: '/nowplaying' },
      { name: '/shuffle', description: 'Shuffle the queue', example: '/shuffle' }
    ]
  },
  settings: {
    title: `${emojis.settings} Settings`,
    description: 'Commands to adjust settings.',
    commands: [
      { name: '/volume <0-100>', description: 'Adjust volume (0-100%)', example: '/volume 50' },
      { name: '/loop <Off/Song/Queue>', description: 'Set loop mode', example: '/loop Song' },
      { name: '/help', description: 'Show this help menu', example: '/help' }
    ]
  }
};

const createHelpEmbed = (interaction, page) => {
  const categoryKeys = Object.keys(commandCategories);
  const category = categoryKeys[page];

  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setAuthor({
      name: 'Music Bot Help',
      iconURL: 'https://i.imgur.com/tQfGnLe.png'
    })
    .setTitle(commandCategories[category].title)
    .setDescription(commandCategories[category].description)
    .addFields(
      commandCategories[category].commands.map(cmd => ({
        name: cmd.name,
        value: `${cmd.description}\n*Example:* \`${cmd.example}\``,
        inline: false
      }))
    )
    .setFooter({
      text: `Requested by ${interaction.user.username} • Page ${page + 1} of ${categoryKeys.length}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp()
    .setThumbnail('https://i.imgur.com/tQfGnLe.png');

  return embed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available music commands'),

  async execute(interaction) {
    let currentPage = 0;

    const embed = createHelpEmbed(interaction, currentPage);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === Object.keys(commandCategories).length - 1)
      );

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'prev') {
        currentPage--;
      } else if (i.customId === 'next') {
        currentPage++;
      }

      const newEmbed = createHelpEmbed(interaction, currentPage);
      await i.update({ embeds: [newEmbed], components: [row] });

      // Update button states
      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === Object.keys(commandCategories).length - 1);
    });

    collector.on('end', () => {
      row.components.forEach(button => button.setDisabled(true));
      message.edit({ components: [row] });
    });
  },
};
