// Provided by 1998CR 
const guilds = []

class EmoteStorage {

    constructor() {
        this.emotes = new Map()
        this.emotesObj = new Map();
    }

        async load(client) {
            this.loadEmotes(client);
        }

        async loadEmotes(client) {
            for (let guildID of guilds) {
                const guild = await client.guilds.cache.get(guildID);
                if (guild) {
                    guild.emojis.cache.forEach(emote => {
                        let emoteStr = "<:" +emote.identifier + ">";
                        this.emotes.set(emote.name, emoteStr)
                        this.emotesObj.set(emote.name, { name: emote.name, id: emote.id });
                    })
                }
            }
        }
}


const Storage = new EmoteStorage();
exports.loadEmotes = async function(client) {
    if (Storage) {
        await Storage.load(client);
        if (Storage.emotes && Storage.emotes.size > 0) {
            return(Storage.emotes)
        }
    }
}

exports.useEmote = function(id) {
    return Storage.emotes.get(id.split(".").join("").split(" ").join("").split("-").join("").split("\n").join("")) ? Storage.emotes.get(id.split(".").join("").split(" ").join("").split("-").join("").split("\n").join("")) : '';
}

exports.loadEmotesObj = function() {
    if (Storage) {
        if (Storage.emotes && Storage.emotes.size > 0) {
            return(Storage.emotesObj)
        }
    }
}
