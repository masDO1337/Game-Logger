const mongoose = require('mongoose');

const game = new mongoose.Schema({
  name: { type: String, required: true },
  applicationId: { type: String, required: false },
  start: { type: Date, required: true },
  stop: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, immutable: true },
    activities: { type: Array, required: false, default: [] },
    history: [game],
    historyStatus: { type: Array, required: false, default: [] },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.getUserHistory = async (userId) => {
    const userData = await User.findOne({ userId: userId });
    return userData ? userData.history : [];
};