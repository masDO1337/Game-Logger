const jwt = require('jsonwebtoken');
const log = require('../Logger');
const UserModel = require('../DBModels/User');

async function refreshToken(req, res, next) {
    const refreshToken = req.cookies?.refreshToken || null;
    if (!refreshToken) {
        req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) });
        return res.redirect("/login");
    }
    
    if (!await UserModel.findOne({ refreshToken: refreshToken }).select('userId')) {
        log.error(`Refresh token not found in database, logging out user: ${req.session.name}.`);
        req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) });
        res.clearCookie("refreshToken", { httpOnly: true, secure: true });
        return res.redirect("/login");
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            log.error(`Invalid refresh token, logging out user: ${req.session.name}.`);
            req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) });
            res.clearCookie("refreshToken", { httpOnly: true, secure: true });
            return res.redirect("/login");
        } else {
            req.session.accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
            next();
        }
    });

}

async function restoreSession(req, res, next) {
    const refreshToken = req.cookies.refreshToken || null;

    if (!refreshToken) return res.redirect("/login");

    let userData = await UserModel.findOne({ refreshToken: refreshToken }).select('userId');
    
    if (!userData) {
        log.error("Refresh token not found in database, clearing cookie.");
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
        return res.redirect("/login");
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            log.error("Invalid refresh token, clearing cookie.");
            res.clearCookie("refreshToken", { httpOnly: true, secure: true });
            return res.redirect("/login");
        } else {
            req.session.accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        }
    });

    let user = await global.client.users.fetch(userData.userId).catch(() => null);

    if (!user || user.bot) return res.redirect("/login");

    if (user && !user.bot) {
        req.session.userId = userData.userId;
        req.session.name = user.tag;
        req.session.avatar = user.displayAvatarURL({ size: 64 });
        req.session.role = userData.role || "user";
        next();
    } else res.redirect("/login");
}


const verify = async (req, res, next) => {
    if (req.session.accessToken) {

        let requireRefresh = false;
        
        jwt.verify(req.session.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err && err.name !== 'TokenExpiredError') {
                // Token is invalid
                log.error(`Invalid access token, logging out user: ${req.session.name}.`);
                req.session.destroy(function (err) { if (err) console.log("Error destroying session:", err) })
                res.clearCookie('refreshToken', { httpOnly: true, secure: true });
                res.redirect("/login");
            } else if (err && err.name === 'TokenExpiredError') {
                // Token has expired
                requireRefresh = true;
            } else {
                // Token is valid
                next();
            }
        });

        if (requireRefresh) await refreshToken(req, res, next);

    }
    else return restoreSession(req, res, next);
};

module.exports = verify;