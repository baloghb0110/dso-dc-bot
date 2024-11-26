// utils/reactionRoleHandler.js
const fs = require('fs');
const path = require('path');

module.exports = async function handleReaction(reaction, user, add) {
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

    if (add) {
      await member.roles.add(roleId);
      console.log(`Hozzáadva a ${roleId} szerep ${user.tag}-nak.`);
    } else {
      await member.roles.remove(roleId);
      console.log(`Eltávolítva a ${roleId} szerep ${user.tag}-tól.`);
    }
  } catch (error) {
    console.error('Nem sikerült módosítani a szerepet:', error);
  }
};
