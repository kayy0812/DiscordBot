require('dotenv').config();
// Discord Libraries
const { 
    prefix, 
    commands,
    z_music
} = require('./config.json');
const { 
    onMessage,
    onAddReaction,
    setToken,
    channelExisted,
    isCommand,
    isBotChat,
    withChannel,
    createMusicCategory,
    getDashboardMusic
} = require('./Client');

// Heroku suporter
const {
    wakeDyno 
} = require('heroku-keep-awake');

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
} = require('./z-music/main');
const {
    simCommand 
} = require('./z-simsimi/main');

// Start message
onMessage(async message => {
    const content = message.content;
    if (isCommand(message, commands.sim)) {
        const msg = content.slice(prefix.length + commands.sim.length).trim();
        simCommand(msg, message);
    }

    if (isCommand(message, commands.play)) {
        const data = content.slice(prefix.length + commands.play.length).trim();
        playCommand(data, message);
    }

    if (isCommand(message, z_music.command.create)) {
        if (!channelExisted(message, z_music.category)) {
            createMusicCategory(message, z_music);
            return true;
        }
        message.delete();
        return false;
    }

    // Xoá mọi tin nhắn được đăng trong kênh điều khiển âm nhạc (trừ bot)
    if (isBotChat(message)) {
        if (withChannel(message, z_music.textChannel)) {
            message.delete();
        }
    }
});