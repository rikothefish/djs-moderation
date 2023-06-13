const { Events } = require('discord.js')

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(client, member) {
        
    }
}