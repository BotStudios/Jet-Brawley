const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'bs-members',
    execute: async ({ interaction, fetchAPI, bsDB, filterTag, useEmote, Embed }) => {
        var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await bsDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(!tag && interaction?.options?.getString('tag')) return interaction.editReply({
                    embeds: [ new MessageEmbed().setDescription(`You haven't save an in-game tag for Brawl Stars`)],
        }); 
        var player = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
        }).catch(err => {});
        if(!interaction?.options?.getString('tag') && !player?.club?.tag) return interaction.editReply({
            embeds: [ new MessageEmbed().setDescription(`You are not in a club, choose the tag option if you'd like to lookup for other clubs`) ]
        });
        const data = await fetchAPI({
            type: 'bs',
            endpoint: `/clubs/${filterTag(interaction?.options?.getString('tag') ? interaction?.options?.getString('tag') : player?.club?.tag )}`
        });
        const { name, badgeId, members } = data;
        const clubTag = data?.tag;
        let seniorCount = members.filter(m => m.role === "senior").length;
        let viceCount = members.filter(m => m.role === "vicePresident").length;
        let president = members.filter(m => m.role === "president")[0];
        const membersEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(clubTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#32a8a2')
        .addField('**Seniors/Vice President Count**', `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${viceCount ? viceCount : 0}`, true)
        .addField('**President**', `${useEmote('brawler')} ${president?.name} | ${president?.tag}`, true)
        .addField('\u200B', '_ _', true) 
        .setDescription(`${members.map((e, i) => `\`${i+1}.\` **${e.trophies} ${useEmote('trophy')} ${e.role === 'member' ? 'Member' : e.role == "president" ? "President" : e.role == 'vicePresident' ? 'Vice President' : 'Senior'} - ${e.name} | ${e.tag}**`).join("\n")}`)
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
