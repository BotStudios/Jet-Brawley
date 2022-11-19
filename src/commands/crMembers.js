const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'cr-members',
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
            embeds: [ new EmbedBuilder().setDescription(`You are not in a clan, choose the tag option if you'd like to lookup for other clans`) ]
        });
        const data = await fetchAPI({
            type: 'cr',
            endpoint: `/clans/${filterTag(interaction?.options?.getString('tag') ? interaction?.options?.getString('tag') : player?.clan?.tag )}`
        });
        const { name, badgeId, memberList } = data;
        const clanTag = data?.tag;
        let seniorCount = memberList.filter(m => m.role === "senior").length;
        let coLeaderCount = memberList.filter(m => m.role === "coLeader").length;
        let president = memberList.filter(m => m.role === "leader")[0];
        const membersEmbed = (msgembed())
        .setTitle(`${name} | ${decodeURIComponent(clanTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#ed82aa')
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
                new EmbedBuilder()
                .setDescription('Something Went Wrong !')
            ]
        })
    } 
    }
}
