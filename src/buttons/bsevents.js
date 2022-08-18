const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'bsupdateevents',
    execute: async ({ interaction, useEmote, axios, fetchAPI, cache, Embed, useEmoteObj }) => {
        const res = await axios.get(`https://api.brawlapi.com/v1/events`).catch(err => {});
        if(!res) return await interaction.update({
            embeds: [new MessageEmbed().setDescription(`Couldn't fetch events.`)]
        });
        const active = res?.data?.active;
        const upcoming = res?.data?.upcoming;
        var brawlers = cache.get('brawlers');
        if(!cache.get('brawlers')){
            brawlers = (await fetchAPI({
                type: 'bs',
             endpoint: '/brawlers'
            }))?.items;
            if(!brawlers)return;
            cache.set('brawlers', brawlers);
        }
        function brawlerName(id) {
            return brawlers.find(b => b.id === id)?.name;
        }
    
        const activeEmbed = new MessageEmbed().setTitle(`Active Events`).setColor('#34eb6b');
        active.forEach(e => {
            activeEmbed.addField(`${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, `**Started** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 5).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`, false);
        })
        const upcomingEmbed = (Embed()).setTitle("Upcoming Events").setColor('#5934eb').setTimestamp();
        upcoming.forEach(e => {
            upcomingEmbed.addField(`${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, `**Starts** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 5).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`, false);
        })

        const updateButton = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('bsupdateevents')
            .setLabel('Update')
            .setStyle('SUCCESS')
        );
        await interaction.update({
            embeds: [activeEmbed, upcomingEmbed],
            components: [updateButton]
        });
    }
}
