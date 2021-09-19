const { Client, Intents, MessageEmbed} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ] 
});
const Discord = {
    onInteraction: function(response) {
        client.on('interactionCreate', response);
    },
    
    onMessage: function(response) {
        client.on('messageCreate', response);
    },

    setToken: function (config, token) {
        client.login(token);

        client.once('ready', function () {
            console.log('Dang su dung [' + client.user.tag + ']')
        });

        const commands = [
            new SlashCommandBuilder().setName('sim')
                .setDescription('Chat with simsimi command!')
                .addStringOption(option => option.setName('msg')
                    .setDescription('Nhập tin nhắn ... ')),
        ].map(command => command.toJSON());
        
        const rest = new REST({ 
            version: '9' 
        }).setToken(token);
        
        (async () => {
            try {
                await rest.put(Routes.applicationGuildCommands(config.clientBotId, config.guildId), { 
                        body: commands
                    },
                );
                console.log('Dang ky thanh cong cac lenh tien ich cua bot!');
            } catch (error) {
                console.error(error);
            }
        })();
    }
}

module.exports = Discord;