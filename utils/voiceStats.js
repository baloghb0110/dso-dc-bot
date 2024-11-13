// utils/voiceStats.js
const fs = require('fs');
const path = require('path');

const statsFilePath = path.join(__dirname, '../stats.json');

let stats = {
  hourlyMaxUsers: {},
};

function loadStats() {
  if (fs.existsSync(statsFilePath)) {
    const data = fs.readFileSync(statsFilePath, 'utf8');
    stats = JSON.parse(data);
  }
}

function saveStats() {
  fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
}

function updateVoiceStats(currentUserCount) {
  const now = new Date();
  const hour = now.getHours(); // 0-23

  if (!stats.hourlyMaxUsers[hour]) {
    stats.hourlyMaxUsers[hour] = 0;
  }

  if (currentUserCount > stats.hourlyMaxUsers[hour]) {
    stats.hourlyMaxUsers[hour] = currentUserCount;
    saveStats();
  }
}

function getDailyStats() {
  return stats.hourlyMaxUsers;
}

function resetDailyStats() {
  stats.hourlyMaxUsers = {};
  saveStats();
}

module.exports = {
  loadStats,
  updateVoiceStats,
  getDailyStats,
  resetDailyStats,
};
