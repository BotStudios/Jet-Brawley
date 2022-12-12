const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'bs-profile',
    execute: async ({ interaction, fetchAPI, bsDB, axios, filterTag, useEmote, msgembed }) => {
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
        if(!tag) return interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription(`You haven't save an in-game tag for Brawl Stars`)],
        });
        const data = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
        });
        const { name, trophies, highestTrophies, expLevel, brawlers, soloVictories, duoVictories, club, isQualifiedFromChampionshipChallenge } = data;
        const playerTag = data.tag;
        const profileEmbed = (msgembed())
        .setTitle(`${name} | ${decodeURIComponent(playerTag)} ${useEmote('smilebs')}`)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#7c8cf7')
        .addFields({ name: `**Trophies**`, value: `${useEmote('trophy')} ${trophies ? trophies : 0 }`, inline: true })
        .addFields({ name: `**Highest Trophies**`, value: `${useEmote('trophy')} ${highestTrophies ? highestTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
       .addFields({ name: '**Level**', value: `${useEmote('xp')} ${expLevel ? expLevel :0}`, inline: true })
       .addFields({ name: `**Solo Victories**`, value: `${useEmote('soloshowdown')} ${soloVictories ? soloVictories : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
       .addFields({ name: `**Duo Victories**`, value: `${useEmote('duoshowdown')} ${duoVictories ? duoVictories : 0}`, inline: true })
       .addFields({ name: `**3v3 Victories**`, value: `${useEmote('3v3')} ${data["3vs3Victories"] ? data["3vs3Victories"] : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
       .addFields({ name: '**Total Brawlers**', value: `${useEmote('brawler')} ${brawlers.length ? brawlers.length : 0}`, inline: true })
         .addFields({ name: '**Club**', value: `${useEmote('club')} ${club?.name ? `${club.name} - ${club.tag}` : 'Not In A Club'}`, inline: true })
          .addFields({ name: '\u200B', value: '_ _', inline: true })
       .setTimestamp()
       profileEmbed.addFields({ name: '**Qualified For Championship Challenge**', value: `${isQualifiedFromChampionshipChallenge ? `${isQualifiedFromChampionshipChallenge == 'true' ? `${useEmote('special')} Yes` : 'No'}` : 'No'}`, inline: false });
      
       await interaction.editReply({
        embeds: [profileEmbed],
        components: [new ActionRowBuilder() .addComponents(
				new ButtonBuilder()
					.setCustomId(`bsprofile-${tag}-${name}`)
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
