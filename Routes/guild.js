const express = require('express');
const UserModel = require('../DBModels/User');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', (req, res) => {
    const guilds = global.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ format: 'png', size: 64 }),
        memberCount: guild.memberCount
    }));

    res.render("guilds", {
        title: "Guilds",
        session: req.session,
        guilds: guilds,
        owner: 'masDO1337'
    });
});

router.get('/:id', async (req, res) => {
    const guild = global.client.guilds.cache.get(req.params.id);
    if (!guild) {
        return res.status(404).render("404", { 
            title: "404 - Not Found",
            message: "The guild you are looking for does not exist or the bot is not a member of it.",
            owner: 'masDO1337'
        });
    }

    const playedUsers = await UserModel.getIDOfUsersPlayed();
    
    res.render("guild", {
        session: req.session,
        guild,
        playedUsers,
        owner: "masDO1337",
    });
});

module.exports = {
    path: '/guild',
    router: router
};