// events/guildMemberUpdate.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(client, oldMember, newMember) {
    // Ellenőrizzük, hogy a szerepek változtak-e
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // Különbségek meghatározása
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

    // Ha nincs változás, nem csinálunk semmit
    if (addedRoles.size === 0 && removedRoles.size === 0) {
      return;
    }

    // Logolási csatorna lekérése
    const logChannelId = config.roleChangeLogChannelId;
    let logChannel = newMember.guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      // Ha a csatorna nincs cache-elve, lekérjük a szerverről
      try {
        logChannel = await newMember.guild.channels.fetch(logChannelId);
      } catch (error) {
        console.error('Nem sikerült lekérni a logolási csatornát:', error);
        return;
      }
    }

    if (!logChannel || !logChannel.isTextBased()) {
      console.error('A logolási csatorna nem található vagy nem szöveges csatorna.');
      return;
    }

    const botAvatarURL = client.user.displayAvatarURL();

    // Külön kezeljük a hozzáadott és eltávolított szerepeket
    const actions = [];

    if (addedRoles.size > 0) {
      actions.push({ type: ':white_check_mark: Hozzáadva', roles: addedRoles, color: '#00ff00' });
    }

    if (removedRoles.size > 0) {
      actions.push({ type: ':no_entry: Eltávolítva', roles: removedRoles, color: '#ff0000' });
    }

    for (const action of actions) {
      const roleNames = action.roles.map(role => role.name).join(', ');
      const embed = new EmbedBuilder()
        .setColor(action.color)
        .setTitle('Rang kezelés')
        .setAuthor({ name: client.user.username, iconURL: botAvatarURL })
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Név', value: `<@${newMember.id}>`, inline: true },
          { name: 'Kezelés típus', value: action.type, inline: true },
          { name: 'Rang', value: roleNames, inline: true }
        )
        .setTimestamp();

      try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Szerep ${action.type.toLowerCase()} logolva.`);
      } catch (error) {
        console.error('Nem sikerült üzenetet küldeni a logolási csatornába:', error);
      }
    }
  },
};
