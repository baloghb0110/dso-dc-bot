// commands/createreactionrole.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
  name: 'createreactionrole',
  description: 'Reakció szerep üzenet létrehozása.',
  usage: '!createreactionrole #csatorna [Cím](Nem kötelező) ||| Üzenet szövege ||| :emoji1:|Role1, :emoji2:|Role2',
  async execute(client, message, args) {
    const { adminRoles } = config;

    // Ellenőrizzük, hogy a felhasználó adminisztrátor-e
    if (!message.member.roles.cache.some(role => adminRoles.includes(role.id))) {
      return message.reply('Ehhez a parancshoz adminisztrátori jogosultság szükséges.');
    }

    // Töröljük a felhasználó parancsot tartalmazó üzenetét
    try {
      await message.delete();
    } catch (error) {
      console.error('Nem sikerült törölni a felhasználó üzenetét:', error);
    }

    if (args.length < 3) {
      return message.reply('Kérlek, add meg a csatornát, az üzenet szövegét és a szerep párosításokat.');
    }

    // Csatorna azonosítása
    const channelMention = args.shift();
    let channelId;

    if (channelMention.startsWith('<#') && channelMention.endsWith('>')) {
      channelId = channelMention.slice(2, -1);
    } else {
      channelId = channelMention;
    }

    const channel = message.guild.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) {
      return message.reply('Kérlek, adj meg egy érvényes szöveges csatornát.');
    }

    // Az üzenet szövegének, címének és a szerep párosításoknak a feldolgozása
    const argsJoined = args.join(' ');

    // Az '||' karakterek alapján szétválasztjuk a részeket
    const sections = argsJoined.split('|||').map(section => section.trim());

    let title = null;
    let messageContent = null;
    let rolesInput = null;

    console.log(sections)

    if (sections.length === 3) {
      // Cím, üzenet szövege, szerep párosítások
      title = sections[0];
      messageContent = sections[1];
      rolesInput = sections[2];
    } else if (sections.length === 2) {
      // Üzenet szövege, szerep párosítások
      messageContent = sections[0];
      rolesInput = sections[1];
    } else {
      return message.reply('Kérlek, add meg a megfelelő szintaxist a parancshoz. Használat: !createreactionrole #csatorna [Cím] || [Üzenet szövege] || [Szerep párosítások]');
    }

    if (!messageContent || !rolesInput) {
      return message.reply('Kérlek, add meg az üzenet szövegét és a szerep párosításokat a "||" karakterekkel elválasztva.');
    }

    // Emojik és szerepek feldolgozása
    const rolesArray = rolesInput.split(',').map(item => item.trim());
    const roleMappings = {};

    for (const item of rolesArray) {
      if (!item.includes('|')) {
        return message.reply(`Érvénytelen formátum a következő párosításnál: "${item}". Használj "Emoji|RoleNameOrID" formátumot.`);
      }

      const [emojiRaw, roleNameOrId] = item.split('|').map(i => i.trim());

      console.log(`Feldolgozás alatt álló emoji: ${emojiRaw}, szerep: ${roleNameOrId}`);

      // Emoji azonosítása
      const customEmojiMatch = emojiRaw.match(/<a?:.+?:(\d+)>/);
      const unicodeEmojiMatch = emojiRaw.match(/^[^\s<]+$/);
      let emojiIdentifier;
      let emojiKey;

      if (customEmojiMatch) {
        // Egyedi emoji
        emojiIdentifier = customEmojiMatch[0]; // Pl.: <:emoji_name:emoji_id>
        emojiKey = customEmojiMatch[1]; // Emoji ID
      } else if (unicodeEmojiMatch) {
        // Unicode emoji
        emojiIdentifier = unicodeEmojiMatch[0];
        emojiKey = emojiIdentifier;
      } else {
        return message.reply(`Érvénytelen emoji: ${emojiRaw}`);
      }

      if (!emojiKey) {
        return message.reply(`Nem sikerült feldolgozni az emojit: ${emojiRaw}`);
      }

      // Szerep keresése név vagy ID alapján
      let role = message.guild.roles.cache.find(r => r.name === roleNameOrId) || message.guild.roles.cache.get(roleNameOrId);

      if (!role) {
        return message.reply(`A szerep nem található: ${roleNameOrId}`);
      }

      // Emoji és szerep párosítása
      roleMappings[emojiKey] = { roleId: role.id, emojiIdentifier };
    }

    // Embed üzenet létrehozása
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(messageContent);

    if (title) {
      embed.setTitle(title);
    }

    try {
      const sentMessage = await channel.send({ embeds: [embed] });

      // Reakciók hozzáadása
      for (const emojiKey in roleMappings) {
        const { emojiIdentifier } = roleMappings[emojiKey];
        await sentMessage.react(emojiIdentifier);
      }

      // Adatok mentése
      const reactionRoleDataPath = path.join(__dirname, '../reactionRoleData.json');

      let reactionRoleData = {};
      if (fs.existsSync(reactionRoleDataPath)) {
        const data = fs.readFileSync(reactionRoleDataPath, 'utf8');
        reactionRoleData = JSON.parse(data);
      }

      reactionRoleData[sentMessage.id] = roleMappings;
      fs.writeFileSync(reactionRoleDataPath, JSON.stringify(reactionRoleData, null, 2));

      // Megerősítő üzenet küldése
      const confirmationMessage = await message.reply('Üzenet sikeresen létrehozva.');

      // Töröljük a megerősítő üzenetet 5 másodperc múlva
      setTimeout(async () => {
        try {
          await confirmationMessage.delete();
        } catch (error) {
          console.error('Nem sikerült törölni a megerősítő üzenetet:', error);
        }
      }, 5000); // 5000 milliszekundum = 5 másodperc

    } catch (error) {
      console.error('Hiba az üzenet küldésekor:', error);
      await message.reply('Hiba történt az üzenet küldése során.');
    }

  },
};
