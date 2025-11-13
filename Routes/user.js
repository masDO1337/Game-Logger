const express = require('express');
const UserModel = require('../DBModels/User');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', async (req, res) => {
    let Playing = [];
    
    const users = await UserModel.getUsersPlaying();

    for (const user of users) {
        const u = await global.client.users.fetch(user.userId);
        Playing.push({
            activities: user.activities,
            id: u.id,
            tag: u.tag,
            username: u.globalName == null ? u.username : u.globalName,
            avatar: u.displayAvatarURL({ format: "png", size: 64 }),
        });
    }

    res.render("users", {
        title: "Playing Now",
        session: req.session,
        playing: Playing,
        owner: 'masDO1337'
    });
});

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

    let userData = {};

    if (!member.user.bot) {
        userData = await UserModel.getUserData(member.user.id);
    }

    res.render("user", {
        session: req.session,
        username: username,
        guild: guild,
        member: member,
        statusTimes: userData.statusTimes || null,
        statusPercentages: userData.statusPercentages || null,
        history: userData.history || [],
        owner: 'masDO1337'
    });
});

module.exports = {
    path: '/user',
    router: router
};