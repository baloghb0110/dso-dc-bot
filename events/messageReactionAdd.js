// events/messageReactionAdd.js
const handleReaction = require('../utils/reactionRoleHandler');

module.exports = {
  name: 'messageReactionAdd',
  async execute(client, reaction, user) {
    await handleReaction(reaction, user, true);
  },
};
