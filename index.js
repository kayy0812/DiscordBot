require('dotenv').config();
// Discord Libraries
const config = require('./config.json');
const ytdl = require('ytdl-core');
const Discord = require('./Discord');

// Youtube music
const {loadMusic} = require('./ytMusic/ytMusic');
Discord.setToken(process.env.TOKEN);

Discord.onMessage(async message => {
    if (message.content.startsWith(config.musicPrefix)) {
        const args = message.content.slice(config.musicPrefix.length).trim().split(/ +/);
        loadMusic(config, args, message);
    }
});