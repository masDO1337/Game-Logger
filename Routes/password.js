const express = require('express');
const UserModel = require('../DBModels/User');
const bcrypt = require('bcrypt');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', (req, res) => {
    res.render("password", {
        title: "Set Password",
        session: req.session,
        password: '',
        confirmPassword: '',
        owner: 'masDO1337',
        error: ''
    });
});

router.post('/', async (req, res) => {
    const password = req.body.password || null;
    const confirmPassword = req.body.confirmPassword || null;

    if (!password || !confirmPassword) return res.redirect('/password');

    if (password.length < 8) return res.render("password", {
        title: "Set Password",
        session: req.session,
        password,
        confirmPassword,
        owner: 'masDO1337',
        error: 'Must contain at least 8 or more characters.'
    });

    if (password !== confirmPassword) return res.render("password", {
        title: "Set Password",
        session: req.session,
        password,
        confirmPassword,
        owner: 'masDO1337',
        error: 'Password and confirm Password not match.'
    });

    let userData = await UserModel.findOne({ userId: req.session.userId });

    if (userData) {
        const hash = await bcrypt.hash(password, await bcrypt.genSalt(12));

        if (!hash) return res.render("password", {
            title: "Set Password",
            session: req.session,
            password,
            confirmPassword,
            owner: "masDO1337",
            error: "Password to hash failed."
        });

        userData.password = hash;
        if (userData.role !== 'admin') {
            userData.role = 'user';
            req.session.role = 'user';
        }
        try {
            await userData.save();
        } catch (err) {
            console.error(`Error saving user data on password: ${err}`);
        }

        res.redirect("/");
    } else {
        res.redirect("/logout");
    }
});

module.exports = {
    path: '/password',
    router: router
};