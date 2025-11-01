const express = require('express');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', (req, res) => {
    
    if (req.session.login) {
        req.session.login = false;
        req.session.id = null;
        req.session.name = null;
        req.session.avatar = null;
    }

    res.redirect('/');
});

module.exports = {
    path: '/logout',
    router: router
};