const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'brawlerList',
    execute: async ({ interaction, fetchAPI, bsDB, filterTag, useEmote, useEmoteObj, args }) => {
        if(!interaction.isSelectMenu())return;
        var data = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(args[1])}`
        }).catch(err => {});
        const { name, badgeId, brawlers } = data;
        const playerTag = data.tag;
        var brawlerList = new ActionRowBuilder().addComponents( 
         new SelectMenuBuilder()
        .setCustomId(`brawlerList-${playerTag}`)
        .setPlaceholder('Choose a category')
        .addOptions([
        { label: 'Trophies', value: 'trophy', emoji: useEmoteObj("trophy")},
        { label: 'Levels', value: 'level', emoji: useEmoteObj('98xp') },
        { label: 'Ranks', value: 'rank', emoji: useEmoteObj('rank1') },
        { label: 'Star Powers', value: 'starpower', emoji: useEmoteObj('starpower') },
        { label: 'Gadgets', value: 'gadget', emoji: useEmoteObj('gadget') }
        ]));
        const brawlerArray = [];
        var brawlersArray = [];
        switch(interaction?.values[0]) {
            default:
            brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${useEmote("trophy")}\`${e?.trophies}\``);
                break;
            case "level":
            brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${useEmote("98xp")}\`${e?.power}\``);      
            break;
            case "rank":
                brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${useEmote(`rank${e?.rank}`)}\`${e?.rank}\``);                
            break;
            case "starpower":
                function getStarpower(e) {
                    var sp = "";
                    var spCount = 0;
                    var data = e.starPowers;
                     for(i in data) {
                         if(!data[i])return;
                         spCount++;
                      sp += (useEmote(`${data[i].id}`) == '') ? useEmote('spgrey') : useEmote(`${data[i].id}`);
                     }  
                     if(spCount == 1) sp += useEmote('spgrey');
                     return sp;
                  }
                 brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${getStarpower(e) ? getStarpower(e) : useEmote('spgrey')}`);
            break;
            case "gadget":
                function getGadget(e) {
                    var gadgets = "";
                    var gadgetsCount = 0;
                    var data = e.gadgets;
                     for(i in data) {
                         if(!data[i])return;
                         gadgetsCount++;
                      gadgets += (useEmote(`${data[i].id}`) == '') ? useEmote('gadgetgrey') : useEmote(`${data[i].id}`);
                     }  
                     if(gadgetsCount == 1) gadgets += useEmote('gadgetgrey');
                     return gadgets;
                  }
             brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${getGadget(e) ? getGadget(e) : useEmote('gadgetgrey')}`);
            break;
        }
    
        const embeds = [];
        for (i = 0; i < brawlersArray.length; i += 30) {
        brawlerArray.push(brawlersArray.slice(i, i + 30));
        }
        var brl = [];
        for (i = 0; i < brawlerArray.length; i += 20) {
         brl.push(brawlerArray.slice(i, i + 20));
        }
        brl.shift().forEach((a, b, c)=> {
            var both = [];
            for (i = 0; i < a.length; i += 2) {
             both.push(a.slice(i, i + 2).join(`_ _`));
            }
            if(b == 0) return embeds.push(new EmbedBuilder().setTitle(`${name} | ${playerTag}'s Brawlers`).setColor('#32a8a2').setDescription(`${both.join("\n")}`));
            if(b + 1 == c.length) return embeds.push(new EmbedBuilder({
                footer: {
                    text: `${brawlers.length} brawlers - Made With Love 💖 By @Joe Lee`
                }
            }).setDescription(`${both.join("\n")}`).setColor('#32a8a2').setTimestamp());
            embeds.push(new EmbedBuilder().setDescription(`${both.join("\n")}`).setColor('#32a8a2'))
        });
        await interaction.update({
        embeds,
        components: [brawlerList]
       });
    }
}
