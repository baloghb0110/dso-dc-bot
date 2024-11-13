// events/guildMemberRemove.js
const config = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    const logChannel = member.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const username = member.user.tag;
    const leaveDate = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    let message = `📤 **Kilépett:** ${username}\n⏰ **Kilépés ideje:** ${leaveDate}`;

    // Ellenőrizzük, hogy kirúgták-e a felhasználót
    try {
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
      });
      const kickLog = fetchedLogs.entries.first();

      if (kickLog) {
        const { executor, target, reason } = kickLog;
        // Ellenőrizzük, hogy az audit log bejegyzés a kilépett felhasználóról szól-e, és az időbélyeg megfelelő-e
        if (target.id === member.id && Date.now() - kickLog.createdTimestamp < 5000) {
          message += `\n👮 **Kirúgta:** ${executor.tag}`;
          if (reason) {
            message += `\n📝 **Indok:** ${reason}`;
          }
        }
      }
    } catch (error) {
      console.error('Hiba az audit logok lekérdezésekor:', error);
    }

    logChannel.send(message);
  },
};