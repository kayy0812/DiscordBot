const ytdl = require('ytdl-core');
const playlist = new Map();

class Queue {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.songs = [];
        this.volume = 100;
        this.playing = true;
        this.repeat = false;
    }

    // Volume
    setVolume(val) {
        this.volume = val;
    }

    // Set playing
    setPlaying(bool) {
        this.playing = bool;
    }

    // Set loop
    setLoop(bool) {
        this.repeat = bool;
    }
}

class Song {
    constructor(title, url) {
        this.title = title;
        this.url = url;
    }
}

const ytMusic = {
    loadMusic: async function (config, args, message) {
        const command = args[0].toLowerCase();
        let serverQueue = playlist.get(message.guild.id);
        if (command === 'play') {
            let voiceChannel = message.member.voice.channel;
            let permissions = voiceChannel.permissionsFor(message.client.user);
            let url = args.slice(1).join(' ');
            if (!voiceChannel || voiceChannel.name !== config.musicChannelName) {
                message.reply('Vào kênh `🎶' + config.musicChannelName + '🎶` để có thể nghe nhạc!');
                return false;
            }

            for (var value of config.musicChannelPerms) {
                if (!permissions.has(value)) {
                    message.reply('Chưa cấp quyền `' + value + '` vào kênh phát này!');
                    return false;
                }
            }

            let video = await ytdl.getInfo(url);
            if (!video) {
                message.reply('Nhập chính xác đường dẫn!');
                return false;
            }
            const song = new Song(video.videoDetails.title, video.videoDetails.video_url);
            if (!serverQueue) {
                let queue = new Queue(voiceChannel);
                playlist.set(message.guild.id, queue);
                queue.songs.push(song);
                let connection = await voiceChannel.join();
                queue.connection = connection;
                playSong(message);
                return true;
            }
            serverQueue.songs.push(song);
            message.reply('🎶 **Đã yêu cầu:** __' + song.title + '__ 🎶');
        }

        if (command === 'clear') {
            if (!serverQueue) return false;
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        }

        if (command === 'next') {
            if (!serverQueue) return false;
            serverQueue.connection.dispatcher.end();
            message.reply('⏸ Đang dừng: __' + serverQueue.songs[0].title + '__ ⏸');
        }
        
        if (command === 'loop') {
            if (!serverQueue) return false;
            if (serverQueue.repeat) {
                serverQueue.setLoop(false);
                message.reply('➿ Tắt lặp: `' + serverQueue.songs[0].title + '` ➿');
                return true;
            }
            serverQueue.setLoop(true);
            message.reply('➿ Bật lặp: `' + serverQueue.songs[0].title + '` ➿');
        }

        if (command === 'playlist') {
            if (!serverQueue) return false;
            let result = serverQueue.songs.map((song, i) => {
                return `${(i == 0) ? `\n🎧 **Đang phát:** __` : `🎧 **${i}.** __`} ${song.title}__ 🎧`
            }).join('\n');
            message.channel.send(result);
        }
    }
}

async function playSong(message) {
    const serverQueue = playlist.get(message.guild.id);
    if (!serverQueue) return;
    if (serverQueue.songs.length < 1) {
        serverQueue.voiceChannel.leave();
        playlist.delete(message.guild.id);
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
    let playing = await message.channel.send('🎧 **Đang phát:** __' + song.title + '__ 🎧');
    dispatcher.on('finish', () => {
        if (!serverQueue.repeat) serverQueue.songs.shift();
        playSong(message);
        return true;
    });
}
module.exports = ytMusic;
