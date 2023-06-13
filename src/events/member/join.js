const { Events } = require('discord.js')

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(client, member) {
        
    }
}