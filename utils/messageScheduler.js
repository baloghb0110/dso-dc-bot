// utils/messageScheduler.js
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
function scheduleMessage(channelId, targetDate, messageContent) {
  const now = new Date();
  if (targetDate <= now) return;

  const job = new cron('0 * * * * *', async () => {

    const client = require('../bot').client;
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    const previousMessageId = scheduledMessages.find(msg => msg.channelId === channelId)?.messageId;
    if (previousMessageId) {
      try {
        const previousMessage = await channel.messages.fetch(previousMessageId);
        if (previousMessage) await previousMessage.delete();
      } catch (error) {
        console.error('Nem sikerült törölni az előző üzenetet:', error);
      }
    }

    try {
      const sentMessage = await channel.send(messageContent);

      const index = scheduledMessages.findIndex(msg => msg.channelId === channelId);
      if (index !== -1) {
        scheduledMessages[index].messageId = sentMessage.id;
      } else {
        scheduledMessages.push({
          channelId,
          messageId: sentMessage.id,
          targetDate: targetDate.toISOString(),
          messageContent,
        });
      }
      saveScheduledMessages();
    } catch (error) {
      console.error('Nem sikerült elküldeni az üzenetet:', error);
    }

    const now = new Date();
    if (now >= new Date(targetDate)) {
      job.stop();
      scheduledMessages = scheduledMessages.filter(msg => msg.channelId !== channelId);
      saveScheduledMessages();
    }
  });

  job.start();
}

function startScheduledMessages(client) {
  loadScheduledMessages();

  scheduledMessages.forEach(msg => {
    const channelId = msg.channelId;
    const targetDate = new Date(msg.targetDate);
    const messageContent = msg.messageContent;

    scheduleMessage(channelId, targetDate, messageContent);
  });
}

module.exports = {
  scheduleMessage,
  startScheduledMessages,
};