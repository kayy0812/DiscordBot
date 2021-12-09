// Discord Libraries
const { prefix, token } = require('./config.json');
const { Client, Intents} = require('discord.js');
const { Player } = require("discord-music-player");

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ] 
});

const player = new Player(client, {
    leaveOnEmpty: false
});

// Định danh cho *client.player* để dẽ dàng dùng nó.
client.player = player;

// Login to Discord
client.login(token);

// Ready
client.once('ready', function () {
    console.log('Logged as in [' + client.user.tag + ']');
    client.user.setActivity("music ♪", { 
        type: "PLAYING" 
    });
});



// Start message
client.on('messageCreate', async message => {
    const content = message.content;
    let guildQueue = client.player.getQueue(message.guild.id);
    // Lệnh tìm nhạc và phát nhạc
    if (content.split(' ')[0] === prefix + 'play') {
        const query = message.content.slice(prefix.length + 'play'.length).trim();
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.play(query).catch(_ => {
            if(!guildQueue)
                queue.stop();
        });
    }

    // Lệnh chuyển nhạc
    if (content.split(' ')[0] === prefix + 'skip') {
        guildQueue.skip();
    }

    // Lệnh xoá tất cả nhạc
    if (content.split(' ')[0] === prefix + 'clear') {
        guildQueue.clearQueue();
    }

    // Lệnh lặp lại bài hát 
    // if (content.split(' ')[0] === prefix + 'loop') {
    //     loopCommand(message);
    // }

    // Lệnh dừng nhạc
    if (content.split(' ')[0] === prefix + 'pause') {
        guildQueue.setPaused(true);
    }

    // Lệnh tiếp tục nhạc
    if (content.split(' ')[0] === prefix + 'resume') {
        guildQueue.setPaused(false);
    }
});