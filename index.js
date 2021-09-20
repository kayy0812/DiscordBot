require('dotenv').config();
// Discord Libraries
const config = require('./config.json');
const Discord = require('./Discord');

// Heroku suporter
const { wakeDyno } = require('heroku-keep-awake');

// Express
const express = require('express');
const app = express();
app.listen(process.env.PORT || 3000, () => {
    wakeDyno(process.env.HEROKU_APP);
});

// Youtube music
const { loadMusic } = require('./ytMusic/ytMusic');
const { loadSimsimi } = require('./simsimi/simsimi');
Discord.setToken(config, process.env.TOKEN);
Discord.onInteraction(async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (commandName === 'sim') {
        if (!interaction.options.getString('msg')) {
            interaction.reply('Nhấp vào biến [msg] phía trên khi viết lệnh /sim')
            return false;
        }
        loadSimsimi(interaction.options.getString('msg'), interaction);
    }
});

Discord.onMessage(async message => {
    if (message.content.startsWith(config.musicPrefix)) {
        const args = message.content.slice(config.musicPrefix.length).trim().split(/ +/);
        loadMusic(config, args, message);
    }
});