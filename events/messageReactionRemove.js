// events/messageReactionRemove.js
const handleReaction = require('../utils/reactionRoleHandler');

module.exports = {
  name: 'messageReactionRemove',
  async execute(client, reaction, user) {
    await handleReaction(reaction, user, false);
  },
};
