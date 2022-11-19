const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'bs-brawlers',
    execute: async ({ interaction, fetchAPI, bsDB, filterTag, useEmote, useEmoteObj }) => {
       var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var user = interaction.options.getUser('user') ? (interaction.options.getUser('user'))?.id : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await bsDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(user) tag = (await bsDB.findOne({ user: `${user}` }))?.tag;
        if(user && !tag) return interaction.editReply({
            embeds: [ new EmbedBuilder().setDescription('This user does not have a saved tag.') ]
        });
        if(!tag)  return interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription(`You haven't save an in-game tag for Brawl Stars`)],
        }); 
        var data = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
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
        brawlersArray = brawlers.map((e) => `${useEmote(e?.name?.toUpperCase())} **${e?.name[0]}${e?.name.slice(1).split("\n").join(" ").toLowerCase()}** ${useEmote("trophy")}\`${e?.trophies}\``);
    
        const brawlerArray = [];
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
                    text: 'Made With Love 💖 By @Joe Lee'
                }
            }).setDescription(`${both.join("\n")}`).setColor('#32a8a2').setTimestamp());
            embeds.push(new EmbedBuilder().setDescription(`${both.join("\n")}`).setColor('#32a8a2'))
        });
        await interaction.editReply({
        embeds,
        components: [brawlerList]
       });

    }catch(e) {
        console.log(e)
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setDescription('Something Went Wrong !')
            ]
        })
    } 
    }
}
