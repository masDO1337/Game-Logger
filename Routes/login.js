const express = require('express');
const jwt = require('jsonwebtoken');
const log = require("../Logger");
const UserModel = require('../DBModels/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.use(async (req, res, next) => {
    if (req.session.accessToken) res.redirect("/logout");
    else next();
});

router.get('/', (req, res) => {
    res.render("login", {
        title: "Login",
        botAvatar: global.client.user.displayAvatarURL({ size: 64 }),
        botName: global.client.user.username,
        botOnline: global.client.ws.status === 0,
        userId: '',
        password: false,
        owner: 'masDO1337',
        error: ''
    });
});

router.post('/', async (req, res) => {
    const userId = ( req.body.userId || null );

    if (!userId || !/^\d+$/.test(userId)) return res.redirect("/login");

    let user = await global.client.users.fetch(userId).catch(() => null);

    if (!user || user.bot) return res.redirect("/login");

    let userData = await UserModel.findOne({ userId: userId });

    if (!userData) return res.redirect("/login");

    if (userData.password) {
        const inputPassword = req.body.password || '';
        if (!inputPassword) {
            return res.render("login", {
                title: "Login",
                botAvatar: global.client.user.displayAvatarURL({ size: 64 }),
                botName: global.client.user.username,
                botOnline: global.client.ws.status === 0,
                userId: userId,
                password: true,
                owner: 'masDO1337',
                error: ''
            });
        }

        const passwordMatch = await bcrypt.compare(inputPassword, userData.password);
        if (!passwordMatch) {
            return res.render("login", {
                title: "Login",
                botAvatar: global.client.user.displayAvatarURL({ size: 64 }),
                botName: global.client.user.username,
                botOnline: global.client.ws.status === 0,
                userId: userId,
                password: true,
                owner: 'masDO1337',
                error: 'Invalid password. Please try again.'
            });
        }
    }

    const accessToken = jwt.sign({ id: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = userData.refreshToken || jwt.sign({ id: userData._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    req.session.accessToken = accessToken;
    req.session.userId = userId;
    req.session.name = user.tag;
    req.session.avatar = user.displayAvatarURL({ size: 64 });
    req.session.role = userData.role || "anonymous";

    userData.refreshToken = refreshToken;
    if (!userData.role) userData.role = "anonymous";

    try {
        await userData.save();
    } catch (err) {
        log.error("Error saving user data on login:", err);
    }

    log(`Login in website as ${user.tag}`);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    if (userData.password) res.redirect("/");
    else res.redirect('/password');
});

module.exports = {
    path: '/login',
    router: router
};