const { updateVoiceChannelStats } = require('../events/voiceStateUpdate');
const { startScheduledMessages } = require('../utils/messageScheduler');

// events/ready.js
module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    startScheduledMessages(client);
    client.guilds.cache.forEach(guild => {
      updateVoiceChannelStats(guild);
    });
  },
};