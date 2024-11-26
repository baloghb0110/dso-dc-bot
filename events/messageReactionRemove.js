// events/messageReactionRemove.js
const handleReaction = require('../utils/reactionRoleHandler');

module.exports = {
  name: 'messageReactionRemove',
  async execute(client, reaction, user) {
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    if (user.bot) return;

    console.log('Reakció eltávolítva:', reaction.emoji.name);
    await handleReaction(client, reaction, user, false);
  },
};
