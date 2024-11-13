// events/messageUpdate.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'messageUpdate',
  async execute(client, oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.system) return;

    if (oldMessage.content === newMessage.content) return;

    const logChannel = newMessage.guild.channels.cache.get(config.messageUpdateLogChannelId);
    if (!logChannel) return;

    const messageAuthor = newMessage.author;

    const messageURL = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Üzenet szerkesztve')
      .setColor('#FFA500')
      .addFields(
        { name: 'Szerző', value: `<@${messageAuthor.id}>`, inline: true },
        { name: 'Csatorna', value: `<#${newMessage.channel.id}>`, inline: true },
        { name: 'Eredeti üzenet', value: oldMessage.content || '[Nincs tartalom]' },
        { name: 'Új üzenet', value: newMessage.content || '[Nincs tartalom]' },
        { name: 'Üzenet linkje', value: `[Ugrás az üzenetre](${messageURL})` }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
