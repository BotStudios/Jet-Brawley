const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'cr-save',
    execute: async ({ interaction, fetchAPI, crDB, useEmote, filterTag }) => {
        try {
        var tag = interaction.options.getString('tag');
        var db = await crDB.findOne({ user: `${interaction?.user?.id}` });
        await interaction.deferReply({
            ephermal: true
        });
        if(!tag && !db) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`
                       \`Please provide a Clash Royale in-game player tag to save\`
                    `)
                    .setImage(`https://brawley.is-a.dev/assets/savecrtag.png`)
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
                    .setImage(`https://brawley.is-a.dev/assets/savecrtag.png`)
                    
            ],
            ephermal: true
        });
        const data = await fetchAPI({
            type: 'cr',
            endpoint: `/players/${filterTag(tag)}`
        });
        if(data?.name && !db) {
            await crDB({
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
            await bsDB({
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
