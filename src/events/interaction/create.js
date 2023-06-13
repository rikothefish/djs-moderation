const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(client, interaction) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCmd.get(interaction.commandName);
      if (!command) return;
      try {
        command.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (!button) return;
      try {
        button.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else if (interaction.isStringSelectMenu()) {
      const menu = client.menus.get(interaction.customId);
      if (!menu) return;
      try {
        menu.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) return;
      try {
        modal.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else if (interaction.isUserContextMenuCommand()) {
      const command = client.userCmd.get(interaction.commandName);
      if (!command) return;
      try {
        command.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else if (interaction.isMessageContextMenuCommand()) {
      const command = client.msgCmd.get(interaction.commandName);
      if (!command) return;
      try {
        command.execute(client, interaction);
      } catch (err) {
        console.log(err.stack);
      }
    } else {
      return;
    }
  },
};
