const express = require('express');
const GameModel = require('../DBModels/Game');
const UserModel = require('../DBModels/User');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', async (req, res) => {

    const games = await GameModel.find().select(["id", "name", "iconURL", "description"]);

    res.render("games", {
        title: "Games",
        session: req.session,
        games: games,
        owner: 'masDO1337'
    });
});

router.get("/:id", async (req, res) => {
    const game = await GameModel.getGame(req.params.id);

    if (!game) {
        return res.status(404).render("404", {
            title: "404 - Not Found",
            message:"The game you are looking for does not exist.",
            owner: "masDO1337",
        });
    }

    let Playing = (await UserModel.getUsersPlayingThatGame(game.name) || []).map(user => {
        return { id: user.userId, start: user.start }
    });

    let Users = [];

    for (const user of game.users) {
        const u = await global.client.users.fetch(user.userId);
        Users.push({
            ...user._doc,
            id: u.id,
            tag: u.tag,
            username: u.globalName == null ? u.username : u.globalName,
            avatar: u.displayAvatarURL({ format: "png", size: 64 }),
        });
    }

    res.render("game", {
        title: game.name,
        session: req.session,
        game: game,
        playing: Playing,
        users: Users,
        owner: "masDO1337",
    });
});

module.exports = {
    path: '/game',
    router: router
};