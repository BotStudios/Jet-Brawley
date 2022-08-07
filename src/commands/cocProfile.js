const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
    name: 'coc-profile',
    execute: async ({ interaction, fetchAPI, cocDB, filterTag, useEmote, delay, Embed }) => {
        var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        try {
        await interaction.deferReply();
        if(!tag) tag = (await cocDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(!tag) return interaction.editReply({
                    embeds: [ new MessageEmbed().setDescription(`You haven't save an in-game tag for Clash Of Clans`)],
        });
        const data = await fetchAPI({
            type: 'coc',
            endpoint: `/players/${filterTag(tag)}`
        });
        const { name, trophies, townHallLevel, expLevel, troops, spells, heroes, bestTrophies, attackWins, defenseWins, builderHallLevel, versusTrophies, versusBattleWins, donations, donationsReceived, clan } = data;
        const playerTag = data?.tag;
    
        const profileEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(playerTag)} ${useEmote('smilebs')}`)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#7c8cf7')
        .addField(`**Trophies**`, `${useEmote('trophy')} ${trophies ? trophies : 0 }`, true)
        .addField(`**Best Trophies**`, `${useEmote('trophy')} ${bestTrophies ? bestTrophies : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Versus Trophies**', `${useEmote('trophy')} ${versusTrophies ? versusTrophies :0}`, true)
        .addField(`**Versus Wins**`, `${useEmote('soloshowdown')} ${versusBattleWins ? versusBattleWins : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField(`**Town Hall Level**`, `${useEmote('duoshowdown')} ${townHallLevel ? townHallLevel : 0}`, true)
        .addField(`**Builder Hall Level**`, `${useEmote('3v3')} ${builderHallLevel ? builderHallLevel : 0}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Attack Wins**', `${useEmote('brawler')} ${attackWins ? attackWins : 0}`, true)
        .addField('**Defense Wins**', `${useEmote('brawler')} ${defenseWins ? defenseWins : 0}`, true)
        .addField('\u200B', '_ _', true) 
        .addField('Unlocked Troops/Spells', `${troops ? troops.length : 0}/${spells ? spells.length : 0}`, true)
        .addField('Experience Level', `${expLevel ? expLevel : 0}`, true)
        .addField('\u200B', '_ _', true) 
        .addField('**Donations/Received**', `${donations}/${donationsReceived}`, true)
        .addField('**Clan**', `${useEmote('club')} ${clan ? `${clan.name} - ${clan.tag}` : 'Not In A Clan'}`, true)
        .addField('\u200B', '_ _', true)
        .addField('**Unlocked Heroes**', `${heroes ? heroes.map(hero => `${hero.name} \`Level ${hero.level}\``).join("\n") : 'None'}`, false)
       .setTimestamp();   
    
       await interaction.editReply({
        embeds: [profileEmbed]
       });
    }catch(e) {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setDescription('Something Went Wrong !')
            ]
        })
    } 
    }
}
