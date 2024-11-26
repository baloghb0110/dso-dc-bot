// utils/messageScheduler.js
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const scheduledMessagesFile = path.join(__dirname, '../scheduledMessages.json');
let scheduledMessages = [];

function loadScheduledMessages() {
  if (fs.existsSync(scheduledMessagesFile)) {
    const data = fs.readFileSync(scheduledMessagesFile, 'utf8');
    scheduledMessages = JSON.parse(data);
  }
}

function saveScheduledMessages() {
  fs.writeFileSync(scheduledMessagesFile, JSON.stringify(scheduledMessages, null, 2));
}

// Üzenet ütemezése
function scheduleMessage(channelId, targetDate, messageContent, client) {
  const now = new Date();
  if (targetDate <= now) return;

  const messageData = {
    id: Date.now().toString(), // Egyedi azonosító generálása
    channelId,
    messageId: null,
    targetDate: targetDate.toISOString(),
    messageContent,
  };

  scheduledMessages.push(messageData);
  saveScheduledMessages();

  // Cron feladat indítása az új üzenethez
  startCronTask(messageData, client);
}

// Ütemezett üzenetek indítása bot indításakor
function startScheduledMessages(client) {
  loadScheduledMessages();

  scheduledMessages.forEach(messageData => {
    // Cron feladat indítása minden üzenethez
    startCronTask(messageData, client);
  });
}

// Cron feladat kezelése egy üzenethez
function startCronTask(messageData, client) {
  const targetDate = new Date(messageData.targetDate);
  const channelId = messageData.channelId;
  const messageContent = messageData.messageContent;

  const task = cron.schedule('0 * * * * *', async () => {
    try {
      const channel = client.channels.cache.get(channelId);
      if (!channel) {
        console.log('Nem található a csatorna.');
        return;
      }

      // Hátralévő idő kiszámítása
      const currentDate = new Date();
      const timeLeft = targetDate - currentDate;
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      const timeLeftString = `${days} nap, ${hours} óra, ${minutes} perc, ${seconds} másodperc`;

      // Előző üzenet törlése
      if (messageData.messageId) {
        try {
          const previousMessage = await channel.messages.fetch(messageData.messageId);
          if (previousMessage) await previousMessage.delete();
        } catch (error) {
          if (error.code === 10008) {
            console.log('Az előző üzenet már törölve lett.');
          } else {
            console.error('Nem sikerült törölni az előző üzenetet:', error);
          }
        }
      }

      // Új embed üzenet létrehozása
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📢 Automatikus klán üzenet')
        .setDescription(messageContent)
        .addFields({ name: '⌛ Hátralévő idő a lejáratig', value: "```" + timeLeftString + "```" })
        .setTimestamp();

      // Új üzenet küldése
      const sentMessage = await channel.send({ embeds: [embed] });

      // Üzenet információinak frissítése
      messageData.messageId = sentMessage.id;
      saveScheduledMessages();

      // Ellenőrizzük, hogy elértük-e a cél dátumot
      const now = new Date();
      if (now >= targetDate) {
        task.stop(); // Feladat leállítása
        console.log('Feladat leállítva, elértük a cél dátumot.');

        // Üzenet információinak eltávolítása
        scheduledMessages = scheduledMessages.filter(msg => msg.id !== messageData.id);
        saveScheduledMessages();
      }
    } catch (error) {
      console.error('Hiba a cron feladatban:', error);
    }
  });
}

module.exports = {
  scheduleMessage,
  startScheduledMessages,
};
