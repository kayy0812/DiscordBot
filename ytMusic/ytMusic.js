const { setActivity } = require('../Discord')
const ytdl = require('ytdl-core');
const { musicChannelName, musicChannelPerms } = require('../config.json');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    NoSubscriberBehavior,
    AudioPlayerStatus 
} = require('@discordjs/voice');
const playlist = new Map();

class Queue {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.player = null;
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
    constructor(title, url, length) {
        this.title = title;
        this.url = url;
        this.length = length;
    }
}

const ytMusic = {
    clearCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return false;
        serverQueue.player.stop();
        serverQueue.songs = [];
        return true;
    },

    nextCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return false;
        if (serverQueue.songs.length > 1) {
            serverQueue.player.stop();
            return true;
        }
        message.reply('Không thể chuyển bài tiếp')
        return false;
    },

    pauseCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return false;
        serverQueue.player.pause();
        return true;
    },

    resumeCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return false;
        serverQueue.player.unpause();
        return true;
    },

    loopCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return;
        if (serverQueue.repeat) {
            serverQueue.setLoop(false);
            message.reply('➿ Tắt lặp: `' + serverQueue.songs[0].title + '` ➿');
            return false;
        }
        serverQueue.setLoop(true);
        message.reply('➿ Bật lặp: `' + serverQueue.songs[0].title + '` ➿');
        return true;
    },

    listCommand: function (message) {
        const serverQueue = playlist.get(message.guild.id);
        if (!serverQueue) return false;
        let result = serverQueue.songs.map((song, i) => {
            return `${(i == 0) ? `\n🎧 **Đang phát:** __` : `🎧 **${i}.** __`} ${song.title}__ 🎧 **(${song.length} giây)**`
        }).join('\n');
        message.reply(result);
        return true;
    },

    playCommand: async function (data, message) {
        const serverQueue = playlist.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel || voiceChannel.name !== musicChannelName) {
            message.reply('Vào kênh `🎶' + musicChannelName + '🎶` để có thể nghe nhạc!');
            return false;
        }
        
        let permissions = voiceChannel.permissionsFor(message.client.user);
        for (var value of musicChannelPerms) {
            if (!permissions.has(value)) {
                message.reply('Chưa cấp quyền `' + value + '` vào kênh phát này!');
                return false;
            }
        }

        try {
            await ytdl.getInfo(data);
        } catch(error) {
            message.reply('ID / URL không tồn tại');
            return false;
        }

        let { videoDetails } = await ytdl.getInfo(data);

        const song = new Song(videoDetails.title, videoDetails.video_url, videoDetails.lengthSeconds);

        if (!serverQueue) {
            let queue = new Queue(voiceChannel);

            playlist.set(message.guild.id, queue);
            queue.songs.push(song);
            
            let connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
            queue.connection = connection;

            let player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            });
            queue.player = player;

            const play = playSong(message);
            if (play) {
                message.reply('🎧 **Đang phát:** __' + song.title + '__ 🎧 **(' + song.length + ' giây)**');
            }
            return true;
        }
        serverQueue.songs.push(song);
        message.reply('🎶 **Đã yêu cầu:** __' + song.title + '__ 🎶 **(' + song.length + ' giây)**');
    }
}

function playSong(message) {
    const serverQueue = playlist.get(message.guild.id);

    if (!serverQueue) return;

    if (serverQueue.songs.length < 1) {
        serverQueue.connection.destroy();
        playlist.delete(message.guild.id);
        message.reply("⏹ Hết dữ liệu yêu cầu ⏹");
        setActivity('your profile!', { 
            type: "WATCHING"
        });
        return false;
    }

    let song = serverQueue.songs[0];
    let audio = ytdl(song.url, {
        quality: 'lowestaudio',
        dlChunkSize: 0
    });

    const resource = createAudioResource(audio, { 
        inlineVolume: true 
    });
    resource.volume.setVolume(serverQueue.volume / 100);

    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
    serverQueue.player.on(AudioPlayerStatus.Idle, function () {
        if (!serverQueue.repeat) serverQueue.songs.shift();
        playSong(message);
        return true;
    });
    serverQueue.player.on(AudioPlayerStatus.Playing, function () {
        setActivity('music: ' + song.title, {
            type: "LISTENING"
        });
    });
    return true;
}

module.exports = ytMusic;
