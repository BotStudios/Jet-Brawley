const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'cr-clan',
    execute: async ({ interaction, fetchAPI, crDB, filterTag, useEmote, msgembed }) => {
               var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var user = interaction.options.getUser('user') ? (interaction.options.getUser('user'))?.id : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await crDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(user) tag = (await crDB.findOne({ user: `${user}` }))?.tag;
        if(user && !tag) return interaction.editReply({
            embeds: [ new EmbedBuilder().setDescription('This user does not have a saved tag.') ]
        });
        if(!tag && interaction?.options?.getString('tag')) return interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription(`You haven't save an in-game tag for Clash Royale`)],
        }); 
        var player = await fetchAPI({
            type: 'cr',
            endpoint: `/players/${filterTag(tag)}`
        }).catch(err => {});
        if(!interaction?.options?.getString('tag') && !player?.clan?.tag) return interaction.editReply({
            embeds: [ new EmbedBuilder().setDescription(`This player wasn't in a clan, choose the tag option if you'd like to lookup for other clans`) ]
        });
        const data = await fetchAPI({
            type: 'cr',
            endpoint: `/clans/${filterTag(interaction?.options?.getString('tag') ? interaction?.options?.getString('tag') : player?.clan?.tag )}`
        });
        const { name, description, type, badgeId, requiredTrophies, clanScore, location, clanWarTrophies, donationsPerWeek, memberList } = data;
        const clanTag = data?.tag;
        const trophies = memberList.map(member => member.trophies).reduce((partialSum, a) => partialSum + a, 0);
        let seniorCount = memberList.filter(m => m.role === "senior").length;
        let coLeaderCount = memberList.filter(m => m.role === "coLeader").length;
        let president = memberList.filter(m => m.role === "leader")[0];
        const profileEmbed = (msgembed())
        .setTitle(`${name} | ${decodeURIComponent(clanTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#32a8a2')
        .addFields({ name: `**Trophies**`, value: `${useEmote('trophy')} ${trophies ? trophies : 0 }`, inline: true })
        .addFields({ name: `**Required Trophies**`, value: `${useEmote('trophy')} ${requiredTrophies ? requiredTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Total Members**', value: `${useEmote('teamleague')} ${memberList.length ? memberList.length : 0}`, inline: true })
        .addFields({ name: '**Type**', value: `${type == 'open' ? `${useEmote('status_green')} Open` : type == 'close' ? `${useEmote('status_red')} Closed` : `${useEmote('status_yellow')} Invite Only`}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Seniors/Co-Leaders Count**', value: `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${coLeaderCount ? coLeaderCount : 0}`, inline: true })
        .addFields({ name: '**Leader**', value: `${useEmote('brawler')} ${president?.name} | ${president?.tag}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Clan Score**', value: `${useEmote('brawler')} ${clanScore ? clanScore : 0}`, inline: true })
        .addFields({ name: '**Clan War Trophies**', value: `${useEmote('brawler')} ${clanWarTrophies ? clanWarTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Donations Per Week**', value: `${useEmote('brawler')} ${donationsPerWeek ? donationsPerWeek : 0}`, inline: true })
        .addFields({ name: '**Location**', value: `${useEmote('brawler')} ${location ? location.name : 'Unknown'}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .setDescription(`\`\`\`${description ? description : 'No Description'}\`\`\``)
       .setTimestamp();
      
       await interaction.editReply({
        embeds: [profileEmbed]
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
