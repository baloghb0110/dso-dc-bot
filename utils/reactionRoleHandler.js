// utils/reactionRoleHandler.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = async function handleReaction(client, reaction, user, add) {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Nem sikerült betölteni a reakciót:', error);
      return;
    }
  }

  const reactionRoleDataPath = path.join(__dirname, '../reactionRoleData.json');

  let reactionRoleData = {};
  if (fs.existsSync(reactionRoleDataPath)) {
    const data = fs.readFileSync(reactionRoleDataPath, 'utf8');
    reactionRoleData = JSON.parse(data);
  }

  const messageId = reaction.message.id;

  if (!reactionRoleData[messageId]) return; // Ha az üzenet nincs a listában

  const roleMappings = reactionRoleData[messageId];

  let emojiKey;
  if (reaction.emoji.id) {
    // Egyedi emoji
    emojiKey = reaction.emoji.id;
  } else {
    // Unicode emoji
    emojiKey = reaction.emoji.name;
  }

  const roleData = roleMappings[emojiKey];

  if (!roleData) return;

  const roleId = roleData.roleId;

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);

    let action;
    if (add) {
      await member.roles.add(roleId);
      console.log(`Hozzáadva a ${roleId} szerep ${user.tag}-nak.`);
      action = 'hozzáadva';
    } else {
      await member.roles.remove(roleId);
      console.log(`Eltávolítva a ${roleId} szerep ${user.tag}-tól.`);
      action = 'eltávolítva';
    }

    console.log(user.bot)

    // Logolás a megadott csatornába
    const logChannelId = config.reactionRoleLogChannelId;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (logChannel && logChannel.isTextBased()) {
      const role = guild.roles.cache.get(roleId);
      const botAvatarURL = client.user.displayAvatarURL();

      const embed = new EmbedBuilder()
        .setColor(add ? '#00ff00' : '#ff0000')
        .setTitle("Rang kezelés")
        .setAuthor({ name: client.user.username, iconURL: botAvatarURL })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Név', value: `<@${user.id}>`, inline: true },
          { name: 'Kezelés típus', value: action, inline: true },
          { name: 'Rang', value: role.name, inline: true }
        )
        //.setDescription(`**${user.tag}** felhasználóhoz ${action} a **${role.name}** szerep.`)
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } else {
      console.error('A logolási csatorna nem található vagy nem szöveges csatorna.');
    }
  } catch (error) {
    console.error('Nem sikerült módosítani a szerepet:', error);
  }
};
