// events/guildMemberAdd.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    const logChannel = member.guild.channels.cache.get(config.enterChatLogId);
    if (!logChannel) return;

    const username = member.user.tag;
    const accountCreationDate = member.user.createdAt.toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });
    const joinDate = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    // Embed létrehozása
    const embed = new EmbedBuilder()
      .setColor('#00FF00') // Választható színkód
      .setTitle('📥 Új tag csatlakozott')
      .setDescription(`<@${member.id}>`) // Tageljük a felhasználót
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Felhasználónév', value: username, inline: true },
        { name: 'Fiók létrehozva', value: accountCreationDate, inline: true },
        { name: 'Belépés ideje', value: joinDate, inline: true }
      )
      .setTimestamp();

    // Üzenet küldése az embed-del
    logChannel.send({ embeds: [embed] });
  },
};
