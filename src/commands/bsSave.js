const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'bs-save',
    execute: async ({ interaction, fetchAPI, bsDB, useEmote, filterTag }) => {
        try {
        var tag = interaction.options.getString('tag');
        var db = await bsDB.findOne({ user: `${interaction?.user?.id}` });
        await interaction.deferReply({
            ephermal: true
        });
        if(!tag && !db) return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`
                       \`Please provide a Brawl Stars in-game player tag to save\`
                    `)
                    .setImage(`https://brawley.is-a.dev/assets/savebstag.png`)
            ],
            ephermal: true
        });
        if(!tag && db) return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`
                    \`To overwite your current saved tag, run this command again with another in-game tag\`

                    **Your Current Tag:** \`${decodeURIComponent(db?.tag)}\`
                    `)
                    .setImage(`https://brawley.is-a.dev/assets/savebstag.png`)
                    
            ],
            ephermal: true
        });
        const data = await fetchAPI({
            type: 'bs',
            endpoint: `/players/${filterTag(tag)}`
        });
        if(data?.name && !db) {
            await bsDB({
            user: `${interaction?.user?.id}`,
            tag: `${filterTag(tag)}`
        }).save();
           return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Successfully saved !')
                    .setDescription(`Your in-game tag (\`${tag}\`) was saved !`)
            ],
            ephermal: true
           });
        }
        if(data?.name && db) {
           db.delete().then(async () => {
            await bsDB({
                user: `${interaction?.user?.id}`,
                tag: `${filterTag(tag)}`
            }).save()
        });
        return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Successfully saved !')
                    .setDescription(`Your in-game tag (\`${tag}\`) was saved & overwrited !`)
            ],
            ephermal: true
           });
        }
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`This tag (\`${tag}\`) does not exist !`)
                ], ephermal: true
            });
    
}catch(e) {
    return await interaction.editReply({
        embeds: [
            new MessageEmbed()
                .setDescription(`This tag (\`${tag}\`) does not exist !`)
        ], ephermal: true
    });
}
    }
}
