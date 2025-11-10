const mongoose = require('mongoose');
const { Schema } = mongoose;

const activity = new mongoose.Schema({
    name: { type: String, required: true },
    applicationId: { type: String, required: false },
    start: { type: Date, required: true }
}, { _id: false });

const game = new mongoose.Schema({
    name: { type: String, required: true },
    applicationId: { type: String, required: false },
    gameDB: { type: Schema.Types.ObjectId, required: false },
    start: { type: Date, required: true },
    stop: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    h: { type: Number, required: true, default: 0 },
    m: { type: Number, required: true, default: 0 },
    s: { type: Number, required: true, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, immutable: true },
    password: { type: String, required: false, default: "" },
    refreshToken: { type: String, required: false, default: "" },
    role: { type: String, required: true, default: "anonymous" },
    activities: [activity],
    history: [game],
    status: { type: String, required: false, default: "offline" },
    lastStatusChange: { type: Number },
    statusTimes: {
        online: { type: Number, required: true, default: 0 },
        idle: { type: Number, required: true, default: 0 },
        dnd: { type: Number, required: true, default: 0 },
        offline: { type: Number, required: true, default: 0 }
    },
    statusPercentages: {
        online: { type: Number, required: true, default: 0 },
        idle: { type: Number, required: true, default: 0 },
        dnd: { type: Number, required: true, default: 0 },
        offline: { type: Number, required: true, default: 0 }
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.getUserData = async (userId) => {
    const userData = await User.findOne({ userId: userId }).select(['history', 'statusPercentages','statusTimes']);
    return userData ? userData : null;
};

module.exports.getIDOfUsersPlayed = async () => {
    const userData = await User.find({"history": {"$exists": true, "$not": {"$size": 0}}}).select('userId');
    return userData ? userData.reduce((a, user) => {a.push(user.userId); return a}, []) : [];
};