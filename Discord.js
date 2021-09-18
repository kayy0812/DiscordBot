const { Client, Intents} = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS
    ] 
});
const Discord = {
    onMessage: function(response) {
        client.on('message', response);
    },
    setToken: function (token) {
        client.login(token);
        client.once('ready',  function () {
            console.log('Dang su dung [' + client.user.tag + ']')
        });
    }
}

module.exports = Discord;