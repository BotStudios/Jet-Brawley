const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'coc-members',
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
        const { name, badgeId, memberList } = data;
        const clanTag = data?.tag;
        let seniorCount = memberList.filter(m => m.role === "admin").length;
        let coLeaderCount = memberList.filter(m => m.role === "coLeader").length;
        let president = memberList.filter(m => m.role === "leader")[0];
        const membersEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(clanTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#ffb5f8')
        .addField('**Senior/Co-Leader Count**', `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${coLeaderCount ? coLeaderCount : 0}`, true)
        .addField('**Leader**', `${useEmote('brawler')} ${president?.name} | ${president?.tag}`, true)
        .addField('\u200B', '_ _', true) 
        .setDescription(`${memberList.map((e, i) => `\`${i+1}.\` **${e.trophies} ${useEmote('trophy')} ${e.role === 'member' ? 'Member' : e.role == "leader" ? "Leader" : e.role == 'coLeader' ? 'Co-Leader' : 'Senior'} - ${e.name} | ${e.tag}**`).join("\n")}`)
       .setTimestamp()
      
       await interaction.editReply({
        embeds: [membersEmbed]
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
