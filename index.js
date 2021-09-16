const config = require('./config.json');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const queues = new Map();
var bot = new Discord.Client();

bot.on('ready', function() {
    console.log('Dang su dung BOT[' + bot.user.tag + ']');
});

class Queue {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.songs = [];
        this.volume = 100;
        this.playing = true;
        this.repeat = false;
    }
}

class Song {
    constructor(title, url) {
        this.title = title;
        this.url = url;
    }
}

bot.on("message", async message => {

    // Youtube MP3
    if (message.content.startsWith(config.musicPrefix)) {
        const args = message.content.slice(config.musicPrefix.length).trim().split(/ +/);
        const command = args[0].toLowerCase();
        let serverQueue = queues.get(message.guild.id);
        if (command === 'play') {
            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel || voiceChannel.name !== config.musicChannelName) {
                message.reply('Vào kênh `🎶' + config.musicChannelName + '🎶` để có thể nghe nhạc!');
                return false;
            }

            let permissions = voiceChannel.permissionsFor(message.client.user);
            for (var value of config.musicChannelPerms) {
                if (!permissions.has(value)) {
                    message.reply('Chưa cấp quyền `' + value + '` vào kênh phát này!');
                    return false;
                }
            }

            let url = args.slice(1).join(' ');
            let video = await ytdl.getInfo(url);
            if (!video) {
                message.reply('Url không hợp lệ!');
                return false;
            }
            const song = new Song(video.videoDetails.title, video.videoDetails.video_url);
            if (!serverQueue) {
                let queue = new Queue(voiceChannel);
                queues.set(message.guild.id, queue);
                queue.songs.push(song);
                let connection = await voiceChannel.join();
                queue.connection = connection;
                playSong(message);
                return true;
            }
            serverQueue.songs.push(song);
            message.reply('🎶 Đã yêu cầu: `' + song.title + '` 🎶');
        }

        if (command === 'stop') {
            if (!serverQueue) {
                return false;
            }
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        }

        if (command === 'next') {
            if (!serverQueue) {
                return false;
            }
            serverQueue.connection.dispatcher.end();
            message.reply('⏸ Đang dừng: `' + serverQueue.songs[0].title + '` ⏸');
        }

        if (command === 'pause') {
            if (!serverQueue) {
                return false;
            }
            serverQueue.connection.dispatcher.pause();
        }

        if (command === 'resume') {
            if (!serverQueue) {
                return false;
            }
            serverQueue.connection.dispatcher.resume();
        }
        
        if (command === 'loop') {
            if (!serverQueue) {
                return false;
            }
            if (serverQueue.repeat) {
                serverQueue.repeat = false;
                message.reply('➿ Tắt lặp: `' + serverQueue.songs[0].title + '` ➿');
                return true;
            }
            serverQueue.repeat = true;
            message.reply('➿ Bật lặp: `' + serverQueue.songs[0].title + '` ➿');
        }

        if (command === 'queue') {
            if (!serverQueue) {
                message.reply('🎼 Hiện danh sách trống! 🎼');
                return false;
            }
            let result = serverQueue.songs.map((song, i) => {
                return `${(i == 0) ? `🎧**Đang phát:** __` : `${i}.`} ${song.title}__ 🎧`
            }).join('\n');
            message.reply(result);
        }
    }
});

async function playSong(message) {
    const serverQueue = queues.get(message.guild.id);
    if (!serverQueue) return;
    if (serverQueue.songs.length < 1) {
        serverQueue.voiceChannel.leave();
        queues.delete(message.guild.id);
        message.channel.send("⏹ Hết dữ liệu yêu cầu ⏹");
        return true;
    }
    let song = serverQueue.songs[0];
    let audio = ytdl(song.url, {
        quality: 'highestaudio',
        highWaterMark: 1024 * 1024 * 12
    });
    let dispatcher = serverQueue.connection.play(audio);
    dispatcher.setVolume(serverQueue.volume / 100);
    message.channel.send('🎧 **Đang phát:** `__' + song.title + '__` 🎧');
    dispatcher.on('finish', () => {
        if (!serverQueue.repeat) serverQueue.songs.shift();
        playSong(message);
        return true;
    });
}

bot.login(config.discord_token);