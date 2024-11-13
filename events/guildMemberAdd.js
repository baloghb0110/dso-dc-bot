// events/guildMemberAdd.js
const config = require('../config.json');

module.exports = {
  name: "guildMemberAdd",
  async execute(client, member) {
    const logChannel = member.guild.channels.cache.get(config.enterChatLogId);
    if (!logChannel) return;

    const username = member.user.tag;
    const accountCreationDate = member.user.createdAt.toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });
    const joinDate = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    const message = `📥 **Belépett:** ${username}\n🗓 **Fiók létrehozva:** ${accountCreationDate}\n⏰ **Belépés ideje:** ${joinDate}`;

    logChannel.send(message);
  },
};