const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'coc-clan',
    execute: async ({ interaction, fetchAPI, cocDB, filterTag, useEmote, Embed }) => {
               var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var user = interaction.options.getUser('user') ? (interaction.options.getUser('user'))?.id : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await cocDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(user) tag = (await cocDB.findOne({ user: `${user}` }))?.tag;
        if(user && !tag) return interaction.editReply({
            embeds: [ new MessageEmbed().setDescription('This user does not have a saved tag.') ]
        });
        if(!tag && interaction?.options?.getString('tag')) return interaction.editReply({
                    embeds: [ new MessageEmbed().setDescription(`You haven't save an in-game tag for Clash Of Clans`)],
        }); 
        var player = await fetchAPI({
            type: 'coc',
            endpoint: `/players/${filterTag(tag)}`
        }).catch(err => {});
        if(!interaction?.options?.getString('tag') && !player?.clan?.tag) return interaction.editReply({
            embeds: [ new MessageEmbed().setDescription(`You are not in a clan, choose the tag option if you'd like to lookup for other clans`) ]
        });
        const data = await fetchAPI({
            type: 'coc',
            endpoint: `/clans/${filterTag(interaction?.options?.getString('tag') ? interaction?.options?.getString('tag') : player?.clan?.tag )}`
        });
        const { name, description, type, badgeId, requiredTrophies, clanLevel, location, clanPoints, warFrequency, memberList, warWins, warLosses, warTies, requiredVersusTrophies, requiredTownhallLevel } = data;
        const clanTag = data?.tag;
        const trophies = memberList.map(member => member.trophies).reduce((partialSum, a) => partialSum + a, 0);
        let seniorCount = memberList.filter(m => m.role === "admin").length;
        let coLeaderCount = memberList.filter(m => m.role === "coLeader").length;
        let leader = memberList.filter(m => m.role === "leader")[0];
        const profileEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(clanTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#ac77ed')
        .addFields({ name: `**Trophies**`, value: `${useEmote('trophy')} ${trophies ? trophies : 0 }`,inline: true })
        .addFields({ name: `**Required Trophies**`, value: `${useEmote('trophy')} ${requiredTrophies ? requiredTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**R. Versus Trophies**', value: `${useEmote('brawler')} ${requiredVersusTrophies ? requiredVersusTrophies : 0}`, inline: true })
        .addFields({ name: '**R. TownHall Level**', value: `${useEmote('brawler')} ${requiredTownhallLevel ? requiredTownhallLevel : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Total Members**', value: `${useEmote('teamleague')} ${memberList.length ? memberList.length : 0}`, inline: true })
        .addFields({ name: '**Type**', value: `${type == 'open' ? `${useEmote('status_green')} Open` : type == 'close' ? `${useEmote('status_red')} Closed` : `${useEmote('status_yellow')} Invite Only`}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Clan Level/Points**', value: `${useEmote('brawler')} ${clanLevel ? clanLevel : 0}/${clanPoints ? clanPoints : 0}`, inline: true })
        .addFields({ name: '**War Wins/Ties/Losses**', value: `${useEmote('brawler')} ${warWins ? warWins : 0}/${warTies ? warTies : 0}/${warLosses ? warLosses : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Location**', value: `${useEmote('brawler')} ${location ? location.name : 'Unknown'}`, inline: true })
        .addFields({ name: '**War Frequency**', value: `${useEmote('brawler')} ${warFrequency ? `${warFrequency[0].toUpperCase()}${warFrequency.slice(1)}` : 'None'}`,inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Senior/Co-Leader Count**', value: `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${coLeaderCount ? coLeaderCount : 0}`, inline: true })
        .addFields({ name: '**Leader**', value: `${useEmote('brawler')} ${leader?.name} | ${leader?.tag}`, inline: true })
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
                new MessageEmbed()
                .setDescription('Something Went Wrong !')
            ]
        })
    } 
    }
}
