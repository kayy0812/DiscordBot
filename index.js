require('dotenv').config();
// Discord Libraries
const config = require('./config.json');
const Discord = require('./Discord');

// Youtube music
const { loadMusic } = require('./ytMusic/ytMusic');
const { loadSimsimi } = require('./simsimi/simsimi');
Discord.setToken(process.env.TOKEN);
Discord.onMessage(async message => {
    if (message.content.startsWith(config.musicPrefix)) {
        const args = message.content.slice(config.musicPrefix.length).trim().split(/ +/);
        loadMusic(config, args, message);
    }
    if (message.content.startsWith(config.simPrefix)) {
        const args = message.content.slice(config.simPrefix.length).trim();
        console.log(args)
        loadSimsimi(config, args, message);
    }
});