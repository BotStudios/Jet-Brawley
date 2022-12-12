const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');


module.exports = {
    name: 'coc-profile',
    execute: async ({ interaction, fetchAPI, cocDB, filterTag, useEmote, delay, msgembed }) => {
               var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        var user = interaction.options.getUser('user') ? (interaction.options.getUser('user'))?.id : '';
        var player;
        try {
        await interaction.deferReply();
        if(!tag) tag = (await cocDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(user) tag = (await cocDB.findOne({ user: `${user}` }))?.tag;
        if(user && !tag) return interaction.editReply({
            embeds: [ new EmbedBuilder().setDescription('This user does not have a saved tag.') ]
        });
        if(!tag) return interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription(`You haven't save an in-game tag for Clash Of Clans`)],
        });
        const data = await fetchAPI({
            type: 'coc',
            endpoint: `/players/${filterTag(tag)}`
        });
        const { name, trophies, townHallLevel, expLevel, troops, spells, heroes, bestTrophies, attackWins, defenseWins, builderHallLevel, versusTrophies, versusBattleWins, donations, donationsReceived, clan } = data;
        const playerTag = data?.tag;
    
        const profileEmbed = (msgembed())
        .setTitle(`${name} | ${decodeURIComponent(playerTag)} ${useEmote('smilebs')}`)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#7c8cf7')
        .addFields({ name: `**Trophies**`, value: `${useEmote('trophy')} ${trophies ? trophies : 0 }`, inline: true })
        .addFields({ name: `**Best Trophies**`, value: `${useEmote('trophy')} ${bestTrophies ? bestTrophies : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Versus Trophies**', value: `${useEmote('trophy')} ${versusTrophies ? versusTrophies :0}`, inline: true })
        .addFields({ name: `**Versus Wins**`, value: `${useEmote('soloshowdown')} ${versusBattleWins ? versusBattleWins : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: `**Town Hall Level**`, value: `${useEmote('duoshowdown')} ${townHallLevel ? townHallLevel : 0}`, inline: true })
        .addFields({ name: `**Builder Hall Level**`, value: `${useEmote('3v3')} ${builderHallLevel ? builderHallLevel : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Attack Wins**', value: `${useEmote('brawler')} ${attackWins ? attackWins : 0}`, inline: true })
        .addFields({ name: '**Defense Wins**', value: `${useEmote('brawler')} ${defenseWins ? defenseWins : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true }) 
        .addFields({ name: 'Unlocked Troops/Spells', value: `${troops ? troops.length : 0}/${spells ? spells.length : 0}`, inline: true })
        .addFields({ name: 'Experience Level', value: `${expLevel ? expLevel : 0}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true }) 
        .addFields({ name: '**Donations/Received**', value: `${donations}/${donationsReceived}`, inline: true })
        .addFields({ name: '**Clan**', value: `${useEmote('club')} ${clan?.name ? `${clan.name} - ${clan.tag}` : 'Not In A Clan'}`, inline: true })
        .addFields({ name: '\u200B', value: '_ _', inline: true })
        .addFields({ name: '**Unlocked Heroes**', value: `${heroes ? heroes.map(hero => `${hero.name} \`Level ${hero.level}\``).join("\n") : 'None'}`, inline: false })
       .setTimestamp();   
    
       await interaction.editReply({
        embeds: [profileEmbed]
       });
    }catch(e) {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setDescription('Something Went Wrong !')
            ]
        })
    } 
    }
}
