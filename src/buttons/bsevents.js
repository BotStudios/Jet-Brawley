const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'bsupdateevents',
    execute: async ({ interaction, useEmote, axios, fetchAPI, cache, msgembed, useEmoteObj }) => {
        const res = await axios.get(`https://api.brawlapi.com/v1/events`).catch(err => {});
        if(!res) return await interaction.update({
            embeds: [new EmbedBuilder().setDescription(`Couldn't fetch events.`)]
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
    
        const activeEmbed = new EmbedBuilder().setTitle(`Active Events`).setColor('#34eb6b');
        active.forEach(e => {
            activeEmbed.addFields({ name: `${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, value: `**Started** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 4).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`, inline: false });
        })
        const upcomingEmbed = (msgembed()).setTitle("Upcoming Events").setColor('#5934eb').setTimestamp();
        upcoming.forEach(e => {
            upcomingEmbed.addFields({ 
name: `${useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) ? useEmote(`${e?.map?.gameMode?.name.split(" ").join("").toLowerCase()}`) : useEmote('angelbs')}  ${e?.map?.gameMode?.name} (${e?.map?.name})`, 
value: `**Starts** <t:${Math.floor(new Date(e?.startTime).getTime() / 1000)}:R>**,**  **Ends** <t:${Math.floor(new Date(e?.endTime).getTime() / 1000)}:R>\n${e?.map?.stats?.slice(0, 4).map(e => `${useEmote(brawlerName(e?.brawler)) ? useEmote(brawlerName(e?.brawler)) : `${brawlerName(e?.brawler)}`}\`${Math.round(e?.winRate)}%\``).join(" ")}`,
  inline: false });
        })

        const updateButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('bsupdateevents')
            .setLabel('Update')
            .setStyle(ButtonStyle.Success)
        );
        await interaction.update({
            embeds: [activeEmbed, upcomingEmbed],
            components: [updateButton]
        });
    }
}
