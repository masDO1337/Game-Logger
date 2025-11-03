const express = require('express');
const router = express.Router();

const verify = require("../Middleware/verify");

router.get('/', verify, (req, res) => {
    res.render("index", {
        title: "Hub",
        session: req.session,
        logs: global.logs || [],
        owner: 'masDO1337'
    });
});

module.exports = {
    path: '/',
    router: router
};