const { Client, IntentsBitField, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const config = require('./config.json');
const voiceStats = require('./utils/voiceStats');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.commands = new Collection();

// Parancsok betöltése
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

// Üzenet küldése éjfélkor
cron.schedule('0 0 * * *', () => {
  const dailyStats = voiceStats.getDailyStats();
  const logChannel = client.channels.cache.get(config.voiceDailyStatsChannelId);
  if (!logChannel) return;

  // Embed létrehozása
  const embed = new EmbedBuilder()
    .setTitle('📊 Napi hangcsatorna statisztikák')
    .setColor('#0099ff')
    .setTimestamp();

  // Statisztikai adatok hozzáadása
  for (let hour = 0; hour < 24; hour++) {
    const userCount = dailyStats[hour] || 0;
    embed.addFields({ name: `${hour}:00 - ${hour}:59`, value: `${userCount} felhasználó`, inline: true });
  }

  // Üzenet küldése az embed-del
  logChannel.send({ embeds: [embed] });

  // Statisztikák visszaállítása
  voiceStats.resetDailyStats();
});

client.login(config.token);