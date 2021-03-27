require('dotenv').config();
const { Bot } = require('./src/bot.js');

const COMMAND = '$';
const bot = new Bot();
bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
	if (msg.author.bot) return;
	if (msg.content.startsWith(COMMAND)) {
		const res = await bot.handleCommand(msg);
		console.log(res);
		if (res !== "") {
			msg.channel.send(res);
		}
	}
});

bot.login(process.env.TOKEN);
