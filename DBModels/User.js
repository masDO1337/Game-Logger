const mongoose = require('mongoose');

const activity = new mongoose.Schema({
    name: { type: String, required: true },
    applicationId: { type: String, required: false },
    start: { type: Date, required: true }
}, { _id: false });

const game = new mongoose.Schema({
    name: { type: String, required: true },
    applicationId: { type: String, required: false },
    start: { type: Date, required: true },
    stop: { type: Date, required: true },
    createdAt: { type: Date, required: true }
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, immutable: true },
  password: { type: String, required: false, default: "" },
  activities: [activity],
  history: [game],
  historyStatus: { type: Array, required: false, default: [] },
  refreshToken: { type: String, required: false, default: "" },
  role: { type: String, required: true, default: "anonymous" },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.getUserHistory = async (userId) => {
    const userData = await User.findOne({ userId: userId });
    return userData ? userData.history : [];
};