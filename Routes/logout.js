const express = require('express');
const UserModel = require('../DBModels/User');
const router = express.Router();

const verify = require("../Middleware/verify");
router.use(verify);

router.get('/', async (req, res) => {

    const userId = req.session.userId || null;
    if (!userId) {
        req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) });
        res.clearCookie("refreshToken", { httpOnly: true, secure: true });
        return res.redirect('/login');
    }
    
    let userData = await UserModel.findOne({ userId: userId });
    if (userData) {
        userData.refreshToken = '';
        try {
            await userData.save();
        } catch (err) {
            console.error("Error clearing refresh token on logout:", err);
        }
    }

    req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    res.redirect('/login');
});

module.exports = {
    path: '/logout',
    router: router
};