const Discord = require('discord.js');
var logger = require('winston');
const Sequelize = require('sequelize');
var auth = require('./auth.json');
const { Op } = require('sequelize');
const banndedUser = "";
var bot = new Discord.Client({

	intents: ["DIRECT_MESSAGE_REACTIONS", "GUILDS", "DIRECT_MESSAGES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],


    
    autorun: true
	
    
});
bot.login(auth.token);

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Deaths = sequelize.define('deaths', {
	username: Sequelize.STRING,
	type: Sequelize.STRING,
});

logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
	colorize: true
});

logger.level = 'debug';
bot.once('ready', () => {
	logger.info('Online');
	Deaths.sync();
});


bot.on('messageCreate', async message => {
	
	//stops if the message is from a BOT
	if (message.author.bot) return;	
	
	//checks if the message is a command and ignores it if it doesnt start with !
	if (!message.content.startsWith('!')) return;
	
	//takes out the !
	const withoutPrefix = message.content.slice(1);
	//splits the message at every space
	const split = withoutPrefix.split(/ +/);
	// puts the first "word" before the space into constant variable "command"
	const command = (split[0]).toString().toLowerCase();
	//the rest of the arguements are stored in args starting at args[0]
	const args = split.slice(1);
    
    if(command === 'terraria' || command === 'te' || command === 'je' || command === 'journeysend') {
        message.reply("Yes I am a Terraria bot");
    }

	if(command === 'count' || command === 'deathcount' || command === 'cd' || command === 'c' || command === 'counter' || command === 'deathcounter') {
		if(args[0]){
			if(args[1]){ //Person and type supplied
				if(getUserFromMention(args[0]) != null){ //make sure person is supplied first

					const count = await Deaths.count({ where:  {[Op.and]: [ {type: {[Op.like]: args[1]}}, {username: getUserFromMention(args[0]).username}]}});
					message.reply(getUserFromMention(args[0]).username + " has died by " + args[1] + " " + count + " times");

				}else{ // !count @user type was not followed
					message.reply("To get a specific user and type use: !count @user type");
				}
			}else{ //only 1 arg was given
				if(getUserFromMention(args[0]) != null){ //the arg is a person

					const count = await Deaths.count({where: {username: getUserFromMention(args[0]).username}});
					message.reply("There have been " + count + " deaths by " + getUserFromMention(args[0]).username);

				}else{ //the arg is a death type
					const count = await Deaths.count({where: {type: {[Op.like]: args[0]}}});
					message.reply("There have been " + count + " deaths from " + args[0]);
				}
			}


		}else{//no other input count all deaths

			const count = await Deaths.count();
			message.reply("There have been " + count + " deaths.");

		}
	}

	if(command === 'death' || command === 'deaths' || command === 'died' || command === 'd') {
		if(args[0]){//Death needs at least 2 args to work
			if(args[0].toString().toLowerCase() === "add" || args[0].toString().toLowerCase() === "a"){	
				if(args[1]){
					if(getUserFromMention(args[1]) != null){
		
						const aDeath = await Deaths.create({
							username: getUserFromMention(args[1]).username,
							type: args[2]
						});
						message.reply("added death");
					}
				}
			}else if(getUserFromMention(args[0]) != null){ //if the first arg is a user
				if(args[1]){//check if there is a type

					const aDeath = await Deaths.create({
						username: getUserFromMention(args[0]).username,
						type: args[1]
					});
					message.reply("added death");
				}else{//death user type not folloed
					
					message.reply("You need to tell me the type of death for example:\n!death @user fire");

				}

			}else if(args[0].toString().toLowerCase() === "delete" || args[0].toString().toLowerCase() === "d"){


				if(args[1]){
					if(getUserFromMention(args[1]) != null){
						if(getUserFromMention(args[1]) == message.author.username || message.author.username == banndedUser){

							message.reply("You can not delete your own death");

						}else{
							if(args[2]){

								const rowCount = await Deaths.destroy({limit: 1, where: {[Op.and]: [ {username: getUserFromMention(args[1]).username}, {type: args[2]}]}} );
								if (!rowCount){ message.reply('You have no deaths to delete') }else { message.reply('death deleted') }

							}else{

								const rowCount = await Deaths.destroy({limit: 1, where: {[Op.and]: [ {username: getUserFromMention(args[1]).username}, {type: "unknown"}]}} );
								if (!rowCount){ message.reply('You have no deaths to delete') }else { message.reply('death deleted') }

							}
						}

					}

				}else{//user input !death delete
					
					message.reply("You need to tell me the user and type of death for example:\n!death delete @user fire");

				}

			}else{ //unrecognized arg[0]

				message.reply("You need to tell me the use and the type of death for example:\n!death @user fire");

			}
		}else{

			const count = await Deaths.count();
			message.reply("There have been " + count + " deaths.");

		}

		//const aDeath = await Deaths.findAll({where: {[Op.and]: [ {username: message.author.username}, {type: args[0]}]}});

	}

	if(command === 'wiki' || command === 'wikipedia' || command === 'builds' || command === 'build'){

		try{message.reply("https://terraria.fandom.com/wiki/Guide:Class_setups");} catch(e){console.log(e);}

	}
});

bot.on('error', err => {
	console.warn(err);
 });


 function getUserFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	const id = matches[1];

	return bot.users.cache.get(id);
	console.log(id);
}
