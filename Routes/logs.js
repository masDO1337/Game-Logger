const express = require('express');
const router = express.Router();

// Middleware to verify user is logged in
const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', (req, res, next) => {
    if (req.session.role !== "admin") return next();

    res.render("logs", {
        title: "logs",
        session: req.session,
        logs: global.logs || [],
        owner: 'masDO1337'
    });
});

module.exports = {
    path: '/logs',
    router: router
};