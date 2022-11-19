const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
module.exports = {
    name: 'bs-map',
    execute: async ({ interaction, useEmote, axios, cache, msgembed }) => {
        await interaction.deferReply();
        const name = interaction.options.getString('name');
        if(!name) return;
        var maps = cache.get('maps');
        if(!cache.get('maps')){
            maps = (await axios.get(`https://api.brawlapi.com/v1/maps`))?.data?.list;
            cache.set('maps', maps);
        }
        var map = maps?.find(m => m?.name?.toLowerCase().split(" ").join("") ===name?.toLowerCase().split(" ").join(""));
        if(!map) return await interaction.editReply({
            embeds: [new EmbedBuilder().setDescription(`Couldn't find map \`${name}\`.`)]
        })
        const embed = (msgembed()).setTitle(`${map?.name}`).setColor('#34eb6b').setTimestamp();
        try {
        const image = await loadImage(map?.imageUrl);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const attach = new AttachmentBuilder(await canvas.createPNGStream(), { name: 'map.png' });
        embed.setImage('attachment://map.png');
        await interaction.editReply({
            embeds: [embed],
            files: [attach]
        });
        }catch(e) {
          console.log(e)
            await interaction.editReply({
                embeds: [new EmbedBuilder().setDescription(`Couldn't find map \`${name}\`.`)],
            });
        }
        }
}
