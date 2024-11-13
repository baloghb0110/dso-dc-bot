// events/messageCreate.js
const config = require('../config.json');

module.exports = {
  name: 'messageCreate',
  execute(client, message) {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('Hiba történt a parancs végrehajtása közben.');
    }
  },
};