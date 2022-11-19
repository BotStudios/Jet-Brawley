const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
const { loadEmotes, useEmote, loadEmotesObj } = require('./emotes.js')
const cocDB = mongoose.model("cocDB", new mongoose.Schema({ tag: String, user: String }));
const bsDB = mongoose.model("bsDB", new mongoose.Schema({ tag: String, user: String }));
const crDB = mongoose.model("crDB", new mongoose.Schema({ tag: String, user: String }));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const selectMenuFiles = fs.readdirSync('./selectMenu').filter(file => file.endsWith('.js'));
const Cache = require('node-cache');
const cache = new Cache({ stdTTL: 60 * 1000 });

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenu = new Collection();
const useEmoteObj = (emote) => {
    var emotes = loadEmotesObj();
     return emotes.get(emote.split(".").join("").split(" ").join("").split("-").join("")) ? emotes.get(emote.split(".").join("").split(" ").join("").split("-").join("")) : '';
};
const token = "";
const filterTag = (tag) => {
    if(typeof tag == 'object' && tag?.tag) return tag?.tag; 
    if(tag && tag.startsWith('%23')) return tag;
    if(tag && !tag.startsWith('#')) return `${encodeURIComponent(`#${tag}`)}`;
    return encodeURIComponent(tag);
} 
const msgembed = (obj) => {
    return new EmbedBuilder({  ...obj, url: 'https://brawley.js.org', footer: { text: `Made With Love 💖 By @Joe Lee` } });
}
const delay = () => { return new Promise(resolve => setTimeout(resolve, 1000)); }
const fetchAPI = async ({ type, endpoint }) => {
    switch(type){
        case "bs":
            type = ``
        break;
        case "cr": 
            type = ``
        break;
        case "coc": 
            type = ``
        break;
        default: 
        throw new Error('Unknown Type');
    }
    return (await axios.get(`${type}/${endpoint}`)).data;
    
};

client.once('ready', async () => {
    console.log(client.user.tag);
    await loadEmotes(client);
    await mongoose.connect('',  { useUnifiedTopology: true, useNewUrlParser: true });
  for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
  }
  for (const file of buttonFiles) {
      const button = require(`./buttons/${file}`);
      client.buttons.set(button.name, button)
  }
  for (const file of selectMenuFiles) {
    const selectMenu = require(`./selectMenu/${file}`);
    client.selectMenu.set(selectMenu.name, selectMenu)
}
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(`${interaction.commandName}${interaction?.options?._subcommand ? `-${interaction.options._subcommand}` : ''}`);
	if (!command) return;
	try {
		await command.execute({ interaction, cache, fetchAPI, cocDB, useEmoteObj, crDB, bsDB, client,  client, axios, filterTag, useEmote, delay, msgembed });
	} catch (error) {
		console.error(error);
}
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isButton())return;
    var id = interaction.customId.split("-")?.[0];
    if(!id) return;
    const button = client.buttons.get(`${id}`);
    try {
        await button.execute({ interaction, fetchAPI, cache, client, useEmote, filterTag, msgembed, axios, delay, useEmoteObj });
    }catch(e) {
        console.log(e)
    }
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isSelectMenu())return;
    var id = interaction.customId.split("-")?.[0];
    if(!id) return;
    const selectMenu = client.selectMenu.get(`${id}`);
    try {
        await selectMenu.execute({ interaction, client, cache, axios, fetchAPI, useEmoteObj, filterTag, msgembed, useEmote, delay, args: interaction?.customId.split("-") });
    }catch(e) {
        console.log(e)
    }
})

client.login(token);

const deployCommands = () => {
const { REST } = require('@discordjs/rest'); 
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders')
const rest = new REST({ version: '9' }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName('about')
        .setDescription('Information about Jet Brawley'),
    new SlashCommandBuilder()
        .setName('bs')
        .setDescription('Brawl Stars Commands')
        .addSubcommand((group) =>
		group
			.setName('profile')
			.setDescription(`Get a player's in-game stats`)
            .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
        )
        .addSubcommand((group) =>
		group
			.setName('club')
			.setDescription(`Club's in-game stats`)
            .addStringOption(option => option.setName('tag').setDescription(`Club's In-Game tag`))
        )
        .addSubcommand((group) =>
		group
			.setName('brawlers')
			.setDescription(`Get a player's in-game brawlers`)
            .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
        )
        .addSubcommand((group) =>
		group
			.setName('members')
			.setDescription(`Get a club's in-game members`)
            .addStringOption(option => option.setName('tag').setDescription(`Club's In-Game tag`))
        )
        .addSubcommand((group) =>
		group
			.setName('events')
			.setDescription(`Get the latest event rotation`)
        )
        .addSubcommand((group) =>
		group
			.setName('save')
			.setDescription(`Save an in-game profile`)
            .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
        )
        .addSubcommand((group) =>
        group
            .setName('map')
            .setDescription(`Search for an in-game map`)
            .addStringOption(option => option.setName('name').setDescription(`Map's name`).setRequired(true))
        )
    ,
        new SlashCommandBuilder()
        .setName('coc')
        .setDescription('Clash Of Clans Commands')
            .addSubcommand((group) =>
            group
                .setName('profile')
                .setDescription(`Get a player's in-game stats`)
                .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('clan')
                .setDescription(`Get a clan's in-game stats`)
                .addStringOption(option => option.setName('tag').setDescription(`Clan's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('members')
                .setDescription(`Get a clan's in-game members`)
                .addStringOption(option => option.setName('tag').setDescription(`Clan's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('save')
                .setDescription(`Save a player's profile`)
                .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
            )
        ,
        new SlashCommandBuilder()
        .setName('cr')
        .setDescription('Clash Royale Commands')
        .addSubcommand((group) =>
            group
                .setName('profile')
                .setDescription(`Get a player's in-game stats`)
                .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('members')
                .setDescription(`Get a clan's in-game members`)
                .addStringOption(option => option.setName('tag').setDescription(`Clan's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('clan')
                .setDescription(`Get a clan's in-game stats`)
                .addStringOption(option => option.setName('tag').setDescription(`Clan's In-Game tag`))
            )
            .addSubcommand((group) =>
            group
                .setName('save')
                .setDescription(`Save a player's profile`)
                .addStringOption(option => option.setName('tag').setDescription(`Player's In-Game tag`))
            )
    
]

;(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
}

// Handcoded By Chee Yong Lee & Bot Studios
// View License: https://github.com/BotStudios/Jet-Brawley/blob/main/LICENSE
// This project is available as open source under the terms of the GPL-3.0 License
// Email: tojoeleeofficial@gmail.com
// Website: https://joe.js.org
// Twitter: @JetBrawley (https://twitter.com/JetBrawley)
