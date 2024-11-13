// events/guildMemberRemove.js
const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    const logChannel = member.guild.channels.cache.get(config.exitChatLogId);
    if (!logChannel) {
      console.error(`Exit log channel not found: ${config.exitChatLogId}`);
      return;
    }

    const username = member.user.tag;
    const leaveDate = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📤 Tag kilépett')
      .setDescription(`<@${member.id}>`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Felhasználónév', value: username, inline: true },
        { name: 'Kilépés ideje', value: leaveDate, inline: true }
      )
      .setTimestamp();

    try {
      const fetchedKickLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      });
      const kickLog = fetchedKickLogs.entries.first();

      const fetchedBanLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      });
      const banLog = fetchedBanLogs.entries.first();

      if (kickLog) {
        const { executor, target, reason, createdTimestamp } = kickLog;
        const timeDifference = Date.now() - createdTimestamp;
        console.log(`Kick Log: Target ID ${target.id}, Member ID ${member.id}, Time Difference: ${timeDifference}ms`);

        if (target.id === member.id && timeDifference < 10000) {
          embed.addFields(
            { name: '👮 Kirúgta', value: `<@${executor.id}>`, inline: true },
            { name: '📝 Indok', value: reason || 'Nincs megadva', inline: true }
          );
          embed.setTitle('📤 Tag kirúgva');
        }
      } else {
        console.log('No kick logs found for this member.');
      }

      if (banLog) {
        const { executor, target, reason, createdTimestamp } = banLog;
        const timeDifference = Date.now() - createdTimestamp;
        console.log(`Ban Log: Target ID ${target.id}, Member ID ${member.id}, Time Difference: ${timeDifference}ms`);

        if (target.id === member.id && timeDifference < 10000) {
          embed.addFields(
            { name: '🔨 Kitiltotta', value: `<@${executor.id}>`, inline: true },
            { name: '📝 Indok', value: reason || 'Nincs megadva', inline: true }
          );
          embed.setTitle('📤 Tag kitiltva');
        }
      } else {
        console.log('No ban logs found for this member.');
      }
    } catch (error) {
      console.error('Hiba az audit logok lekérdezésekor:', error);
    }

    logChannel.send({ embeds: [embed] });
  },
};
