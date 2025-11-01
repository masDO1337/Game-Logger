const express = require('express');
const UserModel = require('../DBModels/User');
const GameModel = require('../DBModels/Game');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get("/:user", async (req, res) => {
    let guildID = null;

    for (const [id, guild] of client.guilds.cache) {
        for (const [userId, member] of guild.members.cache)
            if (userId === req.params.user) {
                guildID = id;
                break;
            }
    }

    if (!guildID) {
        return res.status(404).render("404", {
        title: "404 - Not Found",
        message: "The member you are looking for does not exist or the bot is not a member of it.",
        owner: "masDO1337",
        });
    }

    res.redirect(`/user/${guildID}/${req.params.user}`);
});

router.get('/:guild/:user', async (req, res) => {
    const guild = await global.client.guilds.fetch(req.params.guild).catch(() => null);

    if (!guild) {
        return res.status(404).render("404", { 
            title: "404 - Not Found",
            message: "The guild you are looking for does not exist or the bot is not a member of it.",
            owner: 'masDO1337'
        });
    }

    const member = await guild.members.fetch(req.params.user).catch(() => null);

    if (!member) {
        return res.status(404).render("404", { 
            title: "404 - Not Found",
            message: "The member you are looking for does not exist or the bot is not a member of it.",
            owner: 'masDO1337'
        });
    }

    const username = member.user.globalName == null ? member.user.username : member.user.globalName;

    let history = [];

    if (!member.user.bot) {
        history = await UserModel.getUserHistory(member.user.id);
        for (const game of history) {
            const gameData = await GameModel.getGameIDFromName(game.name);
            if (gameData) {
                game.gameDB = gameData._id;
            } else {
                game.gameDB = '';
            }
        }
    }

    res.render("user", {
        session: req.session,
        username: username,
        guild: guild,
        member: member,
        history: history,
        owner: 'masDO1337'
    });
});

module.exports = {
    path: '/user',
    router: router
};