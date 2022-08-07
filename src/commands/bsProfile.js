const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'bs-profile',
    execute: async ({ interaction, fetchAPI, bsDB, axios, filterTag, useEmote, Embed }) => {
        var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        try {
        await interaction.deferReply();
        if(!tag) tag = (await bsDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(!tag) return interaction.editReply({
                    embeds: [ new MessageEmbed().setDescription(`You haven't save an in-game tag for Brawl Stars`)],
        });
        const data = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
        });
        const { name, trophies, highestTrophies, expLevel, brawlers, soloVictories, duoVictories, club, isQualifiedFromChampionshipChallenge } = data;
        const playerTag = data.tag;

        const profileEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(playerTag)} ${useEmote('smilebs')}`)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#7c8cf7')
        .addField(`**Trophies**`, `${useEmote('trophy')} ${trophies ? trophies : 0 }`, true)
        .addField(`**Highest Trophies**`, `${useEmote('trophy')} ${highestTrophies ? highestTrophies : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField('**Level**', `${useEmote('xp')} ${expLevel ? expLevel :0}`, true)
       .addField(`**Solo Victories**`, `${useEmote('soloshowdown')} ${soloVictories ? soloVictories : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField(`**Duo Victories**`, `${useEmote('duoshowdown')} ${duoVictories ? duoVictories : 0}`, true)
       .addField(`**3v3 Victories**`, `${useEmote('3v3')} ${data["3vs3Victories"] ? data["3vs3Victories"] : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField('**Total Brawlers**', `${useEmote('brawler')} ${brawlers.length ? brawlers.length : 0}`, true)
         .addField('**Club**', `${useEmote('club')} ${club ? `${club.name} - ${club.tag}` : 'Not In A Club'}`, true)
          .addField('\u200B', '_ _', true)
       .setTimestamp()
       profileEmbed.addField('**Qualified For Championship Challenge**', `${isQualifiedFromChampionshipChallenge ? `${isQualifiedFromChampionshipChallenge == 'true' ? `${useEmote('special')} Yes` : 'No'}` : 'No'}`, false);
      
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
