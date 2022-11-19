const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'coc-save',
    execute: async ({ interaction, fetchAPI, cocDB, useEmote, filterTag }) => {
        try {
        var tag = interaction.options.getString('tag');
        var db = await cocDB.findOne({ user: `${interaction?.user?.id}` });
        await interaction.deferReply({
            ephermal: true
        });
        if(!tag && !db) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`
                       \`Please provide a Clash Of Clans in-game player tag to save\`
                    `)
                    .setImage(`https://brawley.is-a.dev/assets/savecoctag.png`)
            ],
            ephermal: true
        });
        if(!tag && db) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`
                    \`To overwite your current saved tag, run this command again with another in-game tag\`

                    **Your Current Tag:** \`${decodeURIComponent(db?.tag)}\`
                    `)
                    .setImage(`https://brawley.is-a.dev/assets/savecoctag.png`)
                    
            ],
            ephermal: true
        });
        const data = await fetchAPI({
            type: 'coc',
            endpoint: `/players/${filterTag(tag)}`
        });
        if(data?.name && !db) {
            await cocDB({
            user: `${interaction?.user?.id}`,
            tag: `${filterTag(tag)}`
        }).save();
           return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Successfully saved !')
                    .setDescription(`Your in-game tag (\`${tag}\`) was saved !`)
            ],
            ephermal: true
           });
        }
        if(data?.name && db) {
           db.delete().then(async () => {
            await cocDB({
                user: `${interaction?.user?.id}`,
                tag: `${filterTag(tag)}`
            }).save()
        });
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Successfully saved !')
                    .setDescription(`Your in-game tag (\`${tag}\`) was saved & overwrited !`)
            ],
            ephermal: true
           });
        }
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`This tag (\`${tag}\`) does not exist !`)
                ], ephermal: true
            });
    
}catch(e) {
    return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`This tag (\`${tag}\`) does not exist !`)
        ], ephermal: true
    });
}
    }
}
