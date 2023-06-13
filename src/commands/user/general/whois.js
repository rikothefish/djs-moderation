const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "whois",
  type: 2,
  async execute(client, interaction) {
    const { targetId, guild } = interaction;
    const member = await guild.members.fetch(targetId).catch(console.error);
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${member.user.bot ? "Bot" : "User"} Info`)
          .addFields(
            { name: "User Tag", value: member.user.tag, inline: false },
            { name: "User ID", value: member.user.id, inline: false },
            {
              name: "Created At",
              value: member.user.createdAt.toUTCString(),
              inline: true,
            },
            {
              name: "Joined At",
              value: member.joinedAt.toUTCString(),
              inline: false,
            },
            {
              name: "Assigned Roles",
              value: member.roles.cache
                .filter((role) => role.name !== "@everyone")
                .map((role) => role)
                .join(", "),
              inline: false,
            }
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
      ],
    });
  },
};
