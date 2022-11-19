const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
module.exports = {
    name: 'bsMapsList',
    execute: async ({ interaction, useEmote, axios, cache, msgembed }) => {
        if(!interaction.isSelectMenu())return;
        var name = cache.get(`${interaction.values[0]}`);
        if(!name) return;
        var maps = cache.get('maps');
        if(!maps){
            maps = (await axios.get(`https://api.brawlapi.com/v1/maps`))?.data?.list;
            cache.set('maps', maps);
        }
        var map = maps?.find(m => m?.name?.toLowerCase() === name.toLowerCase());
        if(!map) return;
        const embed = (msgembed()).setTitle(`${map?.name}`).setColor('#34eb6b').setTimestamp();
        try {
        const image = await loadImage(map?.imageUrl);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const attach = new AttachmentBuilder(await canvas.createPNGStream(), { name: 'map.png' });
        embed.setImage('attachment://map.png');
        await interaction.update({
            embeds: [embed],
            files: [attach],
            components: []
        });
        }catch(e) {
            await interaction.update({
                embeds: [new EmbedBuilder().setDescription(`Couldn't find map \`${name}\`.`)],
            });
        }
        }
}
