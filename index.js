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
        let queue = client.player.createQueue(message.guild.id, {
            data: {
                message: message
            }
        });
        await queue.join(message.member.voice.channel);
        let song = await queue.play(query).catch(_ => {
            if(!guildQueue)
                queue.stop();
        });
    }

    if (content.split(' ')[0] === prefix + 'playlist') {
        const query = message.content.slice(prefix.length + 'playlist'.length).trim();
        let queue = client.player.createQueue(message.guild.id, {
            data: {
                message: message
            }
        });
        await queue.join(message.member.voice.channel);
        let song = await queue.playlist(query).catch(_ => {
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

    // Lệnh dừng nhạc
    if (content.split(' ')[0] === prefix + 'pause') {
        guildQueue.setPaused(true);
    }

    // Lệnh tiếp tục nhạc
    if (content.split(' ')[0] === prefix + 'resume') {
        guildQueue.setPaused(false);
    }

    client.player
        // Emitted when channel was empty.
        .on('channelEmpty',  (queue) =>
            console.log(`Everyone left the Voice Channel, queue ended.`))
        // Emitted when a song was added to the queue.
        .on('songAdd',  (queue, song) =>
            queue.data.message.channel.send(`${song.name}`))
        // Emitted when a playlist was added to the queue.
        .on('playlistAdd',  (queue, playlist) =>
            console.log(`Playlist ${playlist} with ${playlist.songs.length} was added to the queue.`))
        // Emitted when there was no more music to play.
        .on('queueDestroyed',  (queue) =>
            console.log(`The queue was destroyed.`))
        // Emitted when the queue was destroyed (either by ending or stopping).    
        .on('queueEnd',  (queue) =>
            console.log(`The queue has ended.`))
        // Emitted when a song changed.
        .on('songChanged', (queue, newSong, oldSong) =>
            console.log(`${newSong} is now playing.`))
        // Emitted when a first song in the queue started playing.
        .on('songFirst',  (queue, song) =>
            queue.data.message.channel.send(`${song.name}`))
        // Emitted when someone disconnected the bot from the channel.
        .on('clientDisconnect', (queue) =>
            console.log(`I was kicked from the Voice Channel, queue ended.`))
        // Emitted when deafenOnJoin is true and the bot was undeafened
        .on('clientUndeafen', (queue) =>
            console.log(`I got undefeanded.`))
        // Emitted when there was an error in runtime
        .on('error', (error, queue) => {
            console.log(`Error: ${error} in ${queue.guild.name}`);
    });
});