/**
 * Interaction event handler
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const { Events } = require('discord.js');
const { errorEmbed, infoEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle button interactions
    if (interaction.isButton()) {
      try {
        const { customId } = interaction;
        
        switch (customId) {
          case 'support':
            await interaction.reply({ 
              embeds: [infoEmbed('Join our support server for help with the bot!')], 
              ephemeral: true 
            });
            break;
            
          case 'invite':
            await interaction.reply({ 
              embeds: [infoEmbed('Thanks for wanting to invite the bot to your server!')], 
              ephemeral: true 
            });
            break;
            
          default:
            await interaction.reply({ 
              embeds: [errorEmbed('This button is not yet implemented.')], 
              ephemeral: true 
            });
        }
        
        return;
      } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.reply({ 
          embeds: [errorEmbed('There was an error while processing this button!')], 
          ephemeral: true 
        });
        return;
      }
    }
    
    // Only process command interactions
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
      
      const errorMessage = 'There was an error while executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed(errorMessage)], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed(errorMessage)], ephemeral: true });
      }
    }
  },
}; 