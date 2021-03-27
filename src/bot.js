const Discord = require('discord.js');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

class Bot extends Discord.Client {
	constructor(options) {
		super(options);
		this.musicQueue = [];
		this.buffer = [];
		this.connection = null;
		this.dispatcher = null;
		this.channel = null;
	}

	add(el) { this.musicQueue.unshift(el); }

	push(el) { this.musicQueue.push(el); }

	remove(el) {
		let index = this.musicQueue.indexOf(el);
		if (index === -1) { return false; }
		a.splice(index, 1);
		return true;
	}

	removeAt(idx) {
		if (idx < 0 || idx >= this.musicQueue.length) { return false; }
		this.musicQueue.splice(i, 1);
		return true;
	}

	async getStream(name) {
		const searchResults = await ytsr(name, { limit: 1 });
		const url = searchResults.items[0].url;
		const stream = ytdl(url, { filter: "audioonly" });
		return [stream, searchResults.items[0].title];
	}

	setDispatcherListeners() {
		if (this.dispatcher == null) { return; }
		this.dispatcher.on('start', () => { console.log("start dispatcher"); });
		this.dispatcher.on('finish', async () => {
			this.musicQueue.shift();
			this.buffer.shift();
			if (this.musicQueue.length == 0) {
				this.connection.disconnect();
				console.log(this.connection);
				console.log(this.dispatcher);
				this.connection = null;
				this.dispatcher = null;
			} else {
				if (this.buffer.length == 0) {
					const stream; const name;
					[stream, name] = await this.getStream(this.musicQueue[0]);
					this.buffer.push(stream);
				}
				this.dispatcher = this.connection.play(buffer[0]);
				this.setDispatcherListeners();
				if (this.buffer.length == 1 && this.musicQueue.length > 1) {
					const stream; const name;
					[stream, name] = await this.getStream(this.musicQueue[1]);
					this.buffer.push(stream);
				}
			}
		});
		this.dispatcher.on('error', err => console.error(err));
	}

	async handleCommand(msg) {
		console.log(msg.content);
		this.channel = msg.channel;
		let [command, ...args] = msg.content.trim().substring(1).split(/\s+/);
		switch (command.toLowerCase()) {
			case "help":
				return "Valid commands are:\nhelp\nplay";
			case "play":
				if (args.length === 0) { return "ERROR: No name provided"; }
				if (!msg.member.voice.channel) { return "ERROR: Join a voice channel first"; }
				if (this.connection == null) { this.connection = await msg.member.voice.channel.join(); }
				const stream; const name;
				[stream, name] = await this.getStream(args.join(" "));
				this.musicQueue.unshift(args.join(" "));
				this.buffer.unshift(stream);
				this.dispatcher = this.connection.play(this.buffer[0]);
				this.setDispatcherListeners();
				return `Now playing ${name}`;
			case "addToQueue":
				if (args.length === 0) { return "ERROR: No name provided"; }
				this.musicQueue.push(args.join(" "));
				if (this.buffer.length < 2) {
					const stream; const name;
					[stream, name] = await this.getStream(this.musicQueue[this.buffer.length]);
					this.buffer.push(stream);
				}
				return `Added to queue, ${args[1]}`;
			case "pause":
				if (this.dispatcher === null) { return "ERROR: No song playing"; }
				this.dispatcher.pause();
				return "Paused";
			case "resume":
				if (this.dispatcher === null) { return "ERROR: No song playing"; }
				this.dispatcher.resume();
				return "Resumed";
			case "stop":
				this.connection.disconnect();
				this.connection = null;
				this.dispatcher = null;
				this.musicQueue = [];
				this.buffer = [];
				return "Stopped";
			case "next":
				if (this.dispatcher == null) { return "ERROR: No song playing"; }
				if (this.musicQueue.length == 0) { return "Empty Queue"; }
				this.musicQueue.shift(); this.buffer.shift();
				if (this.musicQueue.length == 0) { return "Empty Queue"; }
				this.dispatcher = this.connection.play(this.buffer[0]);
				if (this.buffer.length == 1) {
					const stream; const name;
					[stream, name] = await this.getStream(this.musicQueue[1]);				
					this.buffer.push(stream);	
				}
			default:
				return "Invalid Command";
		}
	}
}

module.exports = { Bot };