const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'bs-club',
    execute: async ({ interaction, fetchAPI, bsDB, filterTag, useEmote, msgembed }) => {
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
        if(!tag && interaction?.options?.getString('tag')) return interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription(`You haven't save an in-game tag for Brawl Stars`)],
        }); 
        var player = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
        }).catch(err => {});
        if(!interaction?.options?.getString('tag') && !player?.club?.tag) return interaction.editReply({
            embeds: [ new EmbedBuilder().setDescription(`This player wasn't in a club, choose the tag option if you'd like to lookup for other clubs`) ]
        });
        const data = await fetchAPI({
            type: 'bs',
            endpoint: `/clubs/${filterTag(interaction?.options?.getString('tag') ? interaction?.options?.getString('tag') : player?.club?.tag )}`
        });
        const { name, trophies, description, type, badgeId, requiredTrophies, members } = data;
        const clubTag = data?.tag;
        let seniorCount = members.filter(m => m.role === "senior").length;
        let viceCount = members.filter(m => m.role === "vicePresident").length;
        let president = members.filter(m => m.role === "president")[0];
        const profileEmbed = (msgembed())
        .setTitle(`${name} | ${decodeURIComponent(clubTag)} ${useEmote('club')} `)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#32a8a2')
        .addFields({ name: `**Trophies**`, value: `${useEmote('trophy')} ${trophies ? trophies : 0 }`, inline: true })
        .addFields({ name: `**Required Trophies**`, value: `${useEmote('trophy')} ${requiredTrophies ? requiredTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Total Members**', value: `${useEmote('teamleague')} ${members.length ? members.length : 0}`, inline: true })
        .addFields({ name: '**Type**', value: `${type == 'open' ? `${useEmote('status_green')} Open` : type == 'close' ? `${useEmote('status_red')} Closed` : `${useEmote('status_yellow')} Invite Only`}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Seniors/Vice President Count**', value: `${useEmote('brawler')} ${seniorCount ? seniorCount : 0}/${viceCount ? viceCount : 0}`, inline: true })
        .addFields({ name: '**President**', value: `${useEmote('brawler')} ${president?.name} | ${president?.tag}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .setDescription(`\`\`\`${description ? description : 'No Description'}\`\`\``)
       .setTimestamp();
      
       await interaction.editReply({
        embeds: [profileEmbed],
        components: [new ActionRowBuilder() .addComponents(
				new ButtonBuilder()
					.setCustomId(`bsclub-${clubTag}-${name}`)
					.setLabel('More Info')
					.setStyle(ButtonStyle.Primary)
		)]
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
