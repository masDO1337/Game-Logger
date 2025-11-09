const mongoose = require('mongoose');

const user = new mongoose.Schema({
    userId: { type: String, required: true },
    start: { type: Date, required: true },
    stop: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    h: { type: Number, required: true, default: 0 },
    m: { type: Number, required: true, default: 0 },
    s: { type: Number, required: true, default: 0 }
}, { _id: false })

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    icon: { type: String, required: false },
    cover_image: { type: String, required: false },
    splash: { type: String, required: false },
    iconURL: { type: String, required: false },
    cover_imageURL: { type: String, required: false },
    splashURL: { type: String, required: false },
    users: [user]
});

const Game = mongoose.model('Game', userSchema);

module.exports = Game;

module.exports.getGame = async (id) => {
    const gameData = await Game.findOne({ _id: id });
    return gameData ? gameData : null;
};