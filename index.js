require('dotenv').config();
// Discord Libraries
const { prefix, commands } = require('./config.json');
const { onMessage, setToken } = require('./Discord');

// Heroku suporter
const { wakeDyno } = require('heroku-keep-awake');

// Express
const express = require('express');
const app = express();
app.listen(process.env.PORT || 3000, () => {
    wakeDyno(process.env.HEROKU_APP);
});

// Login to Discord
setToken(process.env.TOKEN);

// Features Commands
const { 
    playCommand,
    playlistCommand,
    pauseCommand,
    resumeCommand,
    loopCommand
} = require('./ytMusic/ytMusic');
const { 
    simCommand 
} = require('./simsimi/simsimi');

// Start message
onMessage(async message => {
    
    if (message.content.startsWith(prefix + commands.sim)) {
        const msg = message.content.slice(prefix.length + commands.sim.length).trim();
        simCommand(msg, message);
    }

    if (message.content.startsWith(prefix + commands.play)) {
        const data = message.content.slice(prefix.length + commands.play.length).trim().split(/ +/);
        playCommand(data[0], message);
    }

    if (message.content.startsWith(prefix + commands.clear)) {
        clearCommand(message);
    }

    if (message.content.startsWith(prefix + commands.loop)) {
        loopCommand(message);
    }

    if (message.content.startsWith(prefix + commands.playlist)) {
        playlistCommand(message);
    }

    if (message.content.startsWith(prefix + commands.pause)) {
        pauseCommand(message);
    }

    if (message.content.startsWith(prefix + commands.resume)) {
        resumeCommand(message);
    }
});