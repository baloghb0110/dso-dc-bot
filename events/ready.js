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

    // hogy betoltse a regebbi uzeneteket
    // const channel = client.channels.cache.get('1271519291388334200');
    // channel.messages.fetch({ limit: 10 });

    /*
    const channel = client.channels.cache.get('ID'); # Channel ID where the msg was sent
    channel.messages.fetch({ around: MESSAGE_ID, limit: 1 });
    */
  },
};