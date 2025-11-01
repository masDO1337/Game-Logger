const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    
    if (req.session.login == undefined) {
        req.session.login = false;
    }

    if (req.session.login) {
        res.render("index", {
            title: "Hub",
            session: req.session,
            logs: global.logs || [],
            owner: 'masDO1337'
        });
    } else {
        res.render("login", {
            title: "Login",
            session: req.session,
            botAvatar: global.client.user.displayAvatarURL({ size: 64 }),
            botName: global.client.user.username,
            botOnline: global.client.ws.status === 0,
            owner: 'masDO1337'
        });
    }
});

router.post('/', async (req, res) => {
    if (req.session.login) return res.redirect("/");

    const userId = ( req.body.userId || null );

    if (!userId || !/^\d+$/.test(userId)) return res.redirect("/");

    let member = null;

    for (const [id, guild] of client.guilds.cache) {
        member = await guild.members.fetch(userId).catch(() => null);
        if (member) break;
    }

    if (!member) return res.redirect("/");

    const name = member.user.tag;
    console.log(`Login in website as ${name}`);

    req.session.userId = userId;
    req.session.name = name;
    req.session.avatar = member.user.displayAvatarURL({ size: 64 });

    req.session.login = true;
    
    res.redirect("/");
});

module.exports = {
    path: '/',
    router: router
};