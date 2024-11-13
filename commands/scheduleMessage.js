// commands/scheduleMessage.js
const { EmbedBuilder } = require('discord.js');
const { scheduleMessage } = require('../utils/messageScheduler');
const { adminRoles } = require('../config.json');

module.exports = {
  name: 'motd',
  description: 'Automatikusan ütemezett üzenetek óránkánt megadott ideig',
  usage: '!motd <dátum> <üzenet>',
  async execute(message, args) {
    const memberRoles = message.member.roles.cache;
    const isAdmin = adminRoles.some(roleId => memberRoles.has(roleId));

    if (!isAdmin) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Nincs jogosultságod ehhez a parancshoz.')
        .setFooter({ text: 'Az üzenet 5 másodperc múlva törlődik.' });

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => {
          msg.delete().catch(err => console.error('Hiba az üzenet törlésekor:', err));
        }, 5000);
      }).catch(err => console.error('Hiba az üzenet küldésekor:', err));
      return;
    }

    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('ℹ️ Kérlek add meg a dátumot és az üzenetet.')
        .addFields({ name: 'Használat', value: this.usage })
        .setFooter({ text: 'Az üzenet 5 másodperc múlva törlődik.' });

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => {
          msg.delete().catch(err => console.error('Hiba az üzenet törlésekor:', err));
        }, 5000);
      }).catch(err => console.error('Hiba az üzenet küldésekor:', err));

      setTimeout(() => {
        message.delete().catch(err => console.error('Hiba az eredeti üzenet törlésekor:', err));
      }, 5000);

      return;
    }

    const dateString = args[0];
    const messageContent = args.slice(1).join(' ');

    const dateRegex = /^\d{4}\.\d{2}\.\d{2}$/;
    if (!dateRegex.test(dateString)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Érvénytelen dátum formátum.')
        .setDescription('Használd az ÉÉÉÉ.HH.NN formátumot.')
        .setFooter({ text: 'Az üzenet 5 másodperc múlva törlődik.' });

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => {
          msg.delete().catch(err => console.error('Hiba az üzenet törlésekor:', err));
        }, 5000);
      }).catch(err => console.error('Hiba az üzenet küldésekor:', err));

      setTimeout(() => {
        message.delete().catch(err => console.error('Hiba az eredeti üzenet törlésekor:', err));
      }, 5000);

      return;
    }

    const [year, month, day] = dateString.split('.').map(Number);
    const targetDate = new Date(year, month - 1, day);

    // Üzenet ütemezése
    const channelId = message.channel.id; // Az aktuális csatornában küldjük az üzenetet
    scheduleMessage(channelId, targetDate, messageContent, client);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Az üzenet ütemezve lett.')
      .addFields(
        { name: 'Dátum', value: targetDate.toLocaleDateString() },
        { name: 'Üzenet', value: messageContent }
      )
      .setFooter({ text: 'Az üzenet 5 másodperc múlva törlődik.' });

    message.reply({ embeds: [embed] }).then(msg => {
      setTimeout(() => {
        msg.delete().catch(err => console.error('Hiba az üzenet törlésekor:', err));
        message.delete().catch(err => console.error('Hiba az eredeti üzenet törlésekor:', err));
      }, 5000);
    }).catch(err => console.error('Hiba az üzenet küldésekor:', err));
  },
};