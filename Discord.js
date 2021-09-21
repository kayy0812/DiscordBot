const { Client, Intents, MessageEmbed} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ] 
});

const discord = {
    onInteraction: function(response) {
        client.on('interactionCreate', response);
    },
    
    onMessage: function(response) {
        client.on('messageCreate', response);
    },

    setToken: function (token) {
        client.login(token);
        client.once('ready', function () {
            console.log('Dang su dung [' + client.user.tag + ']')
        });
    }
}

module.exports = discord;