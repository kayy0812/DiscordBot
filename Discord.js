const { Client } = require('discord.js');
const client = new Client();
const Discord = {
    onMessage: function(response) {
        client.on('message', response);
    },
    setToken: function (token) {
        client.login(token);
        client.on('ready',  function () {
            console.log('Dang su dung [' + client.user.tag + ']')
        });
    }
}

module.exports = Discord;