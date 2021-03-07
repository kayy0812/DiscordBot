const config    = require('./config.json');
const Discord   = require('discord.js');
const ytdl   = require('ytdl-core');
const queues = new Map();

var bot = new Discord.Client();

bot.on('ready', function(){	  
	console.log('BOT dang hoat dong ! ' + bot.user.tag);	
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
	if (message.content.startsWith(config.bot_prefix)) {
		const message_respone = message.content.slice(config.bot_prefix.length).trim();
	    if(responseMessage[message_respone]) {
            message.reply(responseMessage[message_respone]);
        }
    }

    if (message.content.startsWith(config.sim_prefix)) {
    	const message_to_sim = message.content.slice(config.sim_prefix.length).trim();
    	console.log('Send to Simsimi: ',message_to_sim);
        (async () => {
            const sim_response = await simsimi(message_to_sim);
            message.reply('[SIMSIMI] - ' + sim_response); // What's up ?

        })();
        //message.reply('Chức năng nói chuyện Simsimi đang khoá để tiến hành hoàn thiện');	  	
    }

    if (message.content.startsWith(config.youtube_prefix)) { //youtube_prefix là tiền tố để xác định lệnh đã được khai báo ở trên ("!")
        const args = message.content.slice(config.youtube_prefix.length).trim().split(/ +/);
		const command = args[0].toLowerCase();
		if (command === 'play') {
			let voiceChannel = message.member.voice.channel;
			if (!voiceChannel) return message.reply("Vào kênh âm nhạc trước đã!");
			let permissions = voiceChannel.permissionsFor(message.client.user);
			if (!permissions.has('CONNECT')||!permissions.has('SPEAK')) return message.reply("Thiếu quyền vào kênh âm nhạc hoặc phát nhạc!");
			let url = args.slice(1).join(' ');
			let video = await ytdl.getInfo(url);
			if (!video) return message.reply("Url không hợp lệ!");
			const song = new Song(video.videoDetails.title, video.videoDetails.video_url);
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) {
				let queue = new Queue(voiceChannel);
				queues.set(message.guild.id, queue);
				queue.songs.push(song);
				let connection = await voiceChannel.join();
				queue.connection = connection;
				playSong(message);
			} else {
				serverQueue.songs.push(song);
				message.channel.send(`:notes: Thêm vào hàng chờ: ${song.title}`);
			}
			return
        } 
        if (command === 'stop') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Có bài nào đâu!");
			serverQueue.songs = [];
			serverQueue.connection.dispatcher.end();
			return
		}
		if (command === 'skip') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Không thể skip lúc này!");
			serverQueue.connection.dispatcher.end();
			message.channel.send(`:notes: Bỏ qua bài: ${serverQueue.songs[0].title}`);
			return
		}
		if (command === 'pause') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Không thể thực hiện!");
			serverQueue.connection.dispatcher.pause();
			return
		}
		if (command === 'resume') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Không thể tiếp tục!");
			serverQueue.connection.dispatcher.resume();
			return
		}
		if (command === 'repeat') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Không thể lặp lại!");
			serverQueue.repeat = true;
			message.channel.send(`:notes: Lặp lại bài: ${serverQueue.songs[0].title}`);
			return
		}
		if (command === 'offrepeat') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Có bài nào đâu!");
			serverQueue.repeat = false;
			message.channel.send(`:notes: Ngừng lặp lại bài: ${serverQueue.songs[0].title}`);
			return
		}
		if (command === 'queue') {
			const serverQueue = queues.get(message.guild.id);
			if (!serverQueue) return message.reply("Hiện danh sách trống!");
			let result = serverQueue.songs.map((song, i) => {
				return `${(i == 0) ? `\`Đang phát:\`` : `${i}.`} ${song.title}`
			}).join('\n');
			message.channel.send(result);
			return
		}
    }
});

async function playSong(message) {
	const serverQueue = queues.get(message.guild.id);
	if (!serverQueue) return;
	if (serverQueue.songs.length < 1) {
		serverQueue.voiceChannel.leave();
    		queues.delete(message.guild.id);
    		//return message.channel.send("Hết nhạc!");
	}
	let song = serverQueue.songs[0];
	let dispatcher = serverQueue.connection.play(ytdl(song.url, {filter: 'audioonly', highWaterMark: 1<<25, type: 'opus', dlChunkSize: 0}));
	dispatcher.setVolume(serverQueue.volume/100);
	//message.channel.send(`:notes: Bắt đầu phát: ${song.title}`);
	dispatcher.on('finish', () => {
		if (!serverQueue.repeat) serverQueue.songs.shift();
		return playSong(message);
	});
}


bot.login(config.discord_token);