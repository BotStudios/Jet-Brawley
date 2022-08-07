const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'coc-clan',
    execute: async ({ interaction, fetchAPI, cocDB, filterTag, useEmote, Embed }) => {
        var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await cocDB.findOne({ user: `${interaction.user.id}` }))?.tag;
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
        .addField(`**Trophies**`, `${useEmote('trophy')} ${trophies ? trophies : 0 }`, true)
        .addField(`**Required Trophies**`, `${useEmote('trophy')} ${requiredTrophies ? requiredTrophies : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**R. Versus Trophies**', `${useEmote('brawler')} ${requiredVersusTrophies ? requiredVersusTrophies : 0}`, true)
        .addField('**R. TownHall Level**', `${useEmote('brawler')} ${requiredTownhallLevel ? requiredTownhallLevel : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Total Members**', `${useEmote('teamleague')} ${memberList.length ? memberList.length : 0}`, true)
        .addField('**Type**', `${type == 'open' ? `${useEmote('status_green')} Open` : type == 'close' ? `${useEmote('status_red')} Closed` : `${useEmote('status_yellow')} Invite Only`}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Clan Level/Points**', `${useEmote('brawler')} ${clanLevel ? clanLevel : 0}/${clanPoints ? clanPoints : 0}`, true)
        .addField('**War Wins/Ties/Losses**', `${useEmote('brawler')} ${warWins ? warWins : 0}/${warTies ? warTies : 0}/${warLosses ? warLosses : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Location**', `${useEmote('brawler')} ${location ? location.name : 'Unknown'}`, true)
        .addField('**War Frequency**', `${useEmote('brawler')} ${warFrequency ? `${warFrequency[0].toUpperCase()}${warFrequency.slice(1)}` : 'None'}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Senior/Co-Leader Count**', `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${coLeaderCount ? coLeaderCount : 0}`, true)
        .addField('**Leader**', `${useEmote('brawler')} ${leader?.name} | ${leader?.tag}`, true)
        .addField('\u200B', '_ _', true)
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
