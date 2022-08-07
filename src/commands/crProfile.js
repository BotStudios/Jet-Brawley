const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');


module.exports = {
    name: 'cr-profile',
    execute: async ({ interaction, fetchAPI, crDB, filterTag, useEmote, delay, Embed }) => {
        var tag = interaction.options.getString('tag') ? encodeURIComponent(interaction.options.getString('tag')) : '';
        try {
        await interaction.deferReply();
        if(!tag) tag = (await crDB.findOne({ user: `${interaction.user.id}` }))?.tag;
        if(!tag) return interaction.editReply({
                    embeds: [ new MessageEmbed().setDescription(`You haven't save an in-game tag for Clash Royale`)],
        });
        const data = await fetchAPI({
            type: 'cr',
            endpoint: `/players/${filterTag(tag)}`
        });
        const { name, trophies, bestTrophies, expLevel, currentDeck, cards, wins, losses, battleCount, threeCrownWins, totalDonations, arena, expPoints, currentFavouriteCard, clan } = data;
        const playerTag = data?.tag;
    
        const profileEmbed = (Embed())
        .setTitle(`${name} | ${decodeURIComponent(playerTag)} ${useEmote('smilebs')}`)
        .setAuthor({ name: `${interaction.user.tag}`, icon: interaction.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }) })
        .setColor('#7c8cf7')
        .addField(`**Trophies**`, `${useEmote('trophy')} ${trophies ? trophies : 0 }`, true)
        .addField(`**Best Trophies**`, `${useEmote('trophy')} ${bestTrophies ? bestTrophies : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField('**Level**', `${useEmote('xp')} ${expLevel ? expLevel :0} - ${expPoints}`, true)
       .addField(`**Wins/Losses/Total**`, `${useEmote('soloshowdown')} ${wins ? wins : 0}/${losses ? losses : 0}/${battleCount ? battleCount : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField(`**Three Crowns**`, `${useEmote('duoshowdown')} ${threeCrownWins ? threeCrownWins : 0}`, true)
       .addField(`**Total Donations**`, `${useEmote('3v3')} ${totalDonations ? totalDonations : 0}`, true)
        .addField('\u200B', '_ _', true)
       .addField('**Cards Unlocked**', `${useEmote('brawler')} ${cards ? cards.length : 0}`, true)
       .addField('**Arena**', `${useEmote('brawler')} ${arena ? arena?.name : 0}`, true)
       .addField('\u200B', '_ _', true) 
       .addField('**Favorite Card**', `${currentFavouriteCard ? currentFavouriteCard.name : 'None'}`, true)
       .addField('**Clan**', `${useEmote('club')} ${clan ? `${clan.name} - ${clan.tag}` : 'Not In A Clan'}`, true)
          .addField('\u200B', '_ _', true)
       .setTimestamp();

       const canvas = createCanvas(1085, 183);
       const ctx = canvas.getContext('2d');
       var y = 0;
    try {
       for(i in currentDeck) {
        var img = await loadImage(currentDeck[i]?.iconUrls?.medium);
        ctx.drawImage(img,y,img.height == 330 ? 15 : 0, 137, img.height > 330 ? 183 : 163); y = y + 133;
       }
    }catch(e) {}
      const attach = new MessageAttachment(await canvas.createPNGStream(), 'deck.png');
      profileEmbed.setImage('attachment://deck.png');
      await interaction.editReply({
        embeds: [profileEmbed],
        files: [attach]
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
