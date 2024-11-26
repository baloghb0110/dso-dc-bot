// events/raw.js
module.exports = {
  name: 'raw',
  async execute(client, packet) {
    // Csak a reakció eseményekkel foglalkozunk
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

    const { d: data } = packet;
    const user = await client.users.fetch(data.user_id);
    const channel = await client.channels.fetch(data.channel_id);

    // Ha az üzenet már cache-elve van, nem kell semmit tenni
    if (channel.messages.cache.has(data.message_id)) return;

    try {
      // Lekérjük az üzenetet
      const message = await channel.messages.fetch(data.message_id);

      // Lekérjük a reakciót
      const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
      let reaction = message.reactions.cache.get(emojiKey);

      if (!reaction) {
        // Ha a reakció nincs cache-elve, létrehozzuk
        const emoji = data.emoji.id
          ? client.emojis.cache.get(data.emoji.id)
          : data.emoji.name;
        reaction = message.reactions.cache.set(emojiKey, {
          message,
          emoji,
          count: 0,
          me: false,
        }).get(emojiKey);
      }

      // Esemény kiváltása
      if (packet.t === 'MESSAGE_REACTION_ADD') {
        client.emit('messageReactionAdd', reaction, user);
      } else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        client.emit('messageReactionRemove', reaction, user);
      }
    } catch (error) {
      console.error('Hiba a raw eseménykezelőben:', error);
    }
  },
};
