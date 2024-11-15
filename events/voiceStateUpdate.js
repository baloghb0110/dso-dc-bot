// events/voiceStateUpdate.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const voiceStats = require('../utils/voiceStats');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(client, oldState, newState) {
    // Frissítjük a statisztikákat
    updateVoiceChannelStats(newState.guild);

    const logChannel = oldState.guild.channels.cache.get(config.voiceLogChannelId) || newState.guild.channels.cache.get(config.voiceLogChannelId);
    if (!logChannel) return;

    // Ha a felhasználó bot, ne csináljunk semmit
    if (oldState.member.user.bot) return;

    // Meghatározzuk a régi és új csatornákat
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // Ha ugyanabban a csatornában maradt, nem történt változás
    if (oldChannel === newChannel) return;

    // Meghatározzuk az esemény típusát
    let action = '';
    if (!oldChannel && newChannel) {
      action = 'csatlakozott a hangcsatornához';
    } else if (oldChannel && !newChannel) {
      action = 'kilépett a hangcsatornából';
    } else if (oldChannel && newChannel) {
      action = 'átlépett egyik hangcsatornából a másikba';
    }

    // Embed létrehozása
    const embed = new EmbedBuilder()
      .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL({ dynamic: true }) })
      .setColor('#0099ff')
      .setDescription(`<@${newState.member.id}> ${action}`)
      .setTimestamp();

    // Hozzáadjuk a csatorna információkat
    if (oldChannel) {
      embed.addFields({ name: 'Eredeti csatorna', value: oldChannel.name, inline: true });
    }
    if (newChannel) {
      embed.addFields({ name: 'Új csatorna', value: newChannel.name, inline: true });
    }

    logChannel.send({ embeds: [embed] });
  },
  updateVoiceChannelStats,
};

// Függvény a statisztikák frissítéséhez
function updateVoiceChannelStats(guild) {
  let currentUserCount = 0;

  guild.channels.cache.forEach(channel => {
    if (channel.isVoiceBased()) {
      channel.members.forEach(member => {
        if (!member.user.bot) {
          currentUserCount += 1;
        }
      });
    }
  });
  voiceStats.updateVoiceStats(currentUserCount);
}