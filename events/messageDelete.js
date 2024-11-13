// events/messageDelete.js
const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'messageDelete',
  async execute(client, message) {
    if (!message.guild || message.system) return;

    const logChannel = message.guild.channels.cache.get(config.messageDeleteLogChannelId);
    if (!logChannel) return;

    const messageContent = message.content || '[Nincs tartalom]';

    const messageAuthor = message.author;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Üzenet törölve')
      .setColor('#ff0000')
      .addFields(
        { name: 'Üzenet küldője', value: `<@${messageAuthor.id}>`, inline: true },
        { name: 'Csatorna', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Üzenet tartalma', value: messageContent }
      )
      .setFooter({ text: `Üzenet ID: ${message.id}` })
      .setTimestamp();

    try {
      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete,
      });
      const deletionLog = fetchedLogs.entries.first();

      if (deletionLog) {
        const { executor, target, extra, createdTimestamp } = deletionLog;

        if (target.id === messageAuthor.id &&
          (extra.channel.id === message.channel.id || extra.channel.id === message.channel.parentId) &&
          Date.now() - createdTimestamp < 5000) {

          embed.addFields({ name: 'Törölte', value: `<@${executor.id}>`, inline: true });
        } else {

          embed.addFields({ name: 'Törölte', value: `<@${messageAuthor.id}> (saját maga)`, inline: true });
        }
      } else {

        embed.addFields({ name: 'Törölte', value: `<@${messageAuthor.id}> (saját maga)`, inline: true });
      }
    } catch (error) {
      console.error('Hiba az audit logok lekérdezésekor:', error);
      embed.addFields({ name: 'Törölte', value: 'Ismeretlen', inline: true });
    }

    logChannel.send({ embeds: [embed] });
  },
};
