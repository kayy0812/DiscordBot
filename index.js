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
    listCommand,
    pauseCommand,
    resumeCommand,
    nextCommand,
    clearCommand,
    loopCommand
} = require('./ytMusic/ytMusic');
const { 
    simCommand 
} = require('./simsimi/simsimi');

// Start message
onMessage(async message => {
    const content = message.content;
    if (content.split(' ')[0] === prefix + commands.sim) {
        const msg = content.slice(prefix.length + commands.sim.length).trim();
        simCommand(msg, message);
    }

    if (content.split(' ')[0] === prefix + commands.play) {
        const data = message.content.slice(prefix.length + commands.play.length).trim().split(/ +/);
        playCommand(data[0], message);
    }

    if (content.split(' ')[0] === prefix + commands.next) {
        nextCommand(message);
    }

    if (content.split(' ')[0] === prefix + commands.clear) {
        clearCommand(message);
    }

    if (content.split(' ')[0] === prefix + commands.loop) {
        loopCommand(message);
    }

    if (content.split(' ')[0] === prefix + commands.list) {
        listCommand(message);
    }

    if (content.split(' ')[0] === prefix + commands.pause) {
        pauseCommand(message);
    }

    if (content.split(' ')[0] === prefix + commands.resume) {
        resumeCommand(message);
    }
});