const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'bs-events',
    execute: async ({ interaction, fetchAPI, bsDB, filterTag, useEmote, useEmoteObj, axios, cache, Embed }) => {
        await interaction.deferReply();
        const res = await axios.get(`https://api.brawlapi.com/v1/events`).catch(err => {});
        if(!res) return await interaction.editReply({
            embeds: [new MessageEmbed().setDescription(`Couldn't fetch events.`)]
        });
        const active = res?.data?.active;
        const upcoming = res?.data?.upcoming;
        var brawlers = cache.get('brawlers');
        if(!Array.isArray(cache.get('brawlers'))){
            try {
            brawlers = (await fetchAPI({
                type: 'bs',
                endpoint: '/brawlers'
            }))?.items;
            if(!brawlers)return;
            cache.set('brawlers', brawlers);
        }catch(e) {}
        }
        function brawlerName(id) {
            return brawlers.find(b => b.id === id)?.name;
        }
        const maps = [];
    
        const activeEmbed = new MessageEmbed().setTitle(`Active Events`).setColor('#34eb6b');
        active.forEach(e => {
            var random = require('crypto').randomBytes(10).toString('hex');
            activeEmbed.addFields({ name: `${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, value: `**Started** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 4).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`, inline: false });
            cache.set(`${random}`, e?.map?.name.toLowerCase());
            maps.push({ label: `${e?.map?.name}`, value: `${random}`, emoji: useEmoteObj(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmoteObj(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmoteObj('angelbs') });
        })
        const upcomingEmbed = (Embed()).setTitle("Upcoming Events").setColor('#5934eb').setTimestamp();
        upcoming.forEach(e => {
            upcomingEmbed.addFields({ name: `${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, value: `**Starts** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 4).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`, inline: false });
        })
        var mapsList = new MessageActionRow().addComponents( 
            new MessageSelectMenu()
           .setCustomId(`bsMapsList`)
           .setPlaceholder('Choose a map for active events')
           .addOptions(maps));
        const updateButton = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('bsupdateevents')
            .setLabel('Update')
            .setStyle('SUCCESS')
        );
        await interaction.editReply({
            embeds: [activeEmbed, upcomingEmbed],
            components: [mapsList, updateButton]
        });
        }
}
