module.exports = {
  name: "ping",
  type: 1,
  description: "test command.",
  async execute(client, interaction) {
    interaction.reply({
      content: "test command is working.",
    });
  },
};
