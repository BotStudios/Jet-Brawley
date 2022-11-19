const { EmbedBuilder, version } = require('discord.js');
module.exports = {
    name: 'about',
    execute: async ({ interaction, axios, msgembed, client }) => {
        await interaction.deferReply();
        try {
         about = (await axios.get(`https://brawley.js.org/about.json`)).data;
        }catch(e) {}
      if(!about) return await interaction.editReply({
        embeds: [new EmbedBuilder().setDescription(`Hey ${interaction?.user?.username}, I couldn't fetch information about myself at this moment, can you please visit [My Website](https://brawley.js.org) instead.`)]
      })
        const embed = (msgembed(about?.embed));
        embed.setAuthor({ name: `${about?.greet ? about?.greet[Math.floor(Math.random() * about?.greet?.length)] : 'Hello There'} ${interaction?.user?.username}`, iconURL: interaction?.user?.avatarURL({ dynamic: true, format: 'png', size: 1024 }) });
        embed.setThumbnail(client?.user?.avatarURL({ dynamic: true, format: 'png', size: 1024 }))
        embed.setTitle(`Jet Brawley`)
        embed.setDescription(`${about?.description.split("{discord.js-version}").join(version).split("{uptime}").join(`<t:${Math.floor(client.readyAt / 1000)}> (<t:${Math.floor(client.readyAt / 1000)}:R>)`)}`)
        embed.setTimestamp()
        await interaction.editReply({
            embeds: [embed]
        });
    }
}
