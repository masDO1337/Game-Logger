const verify = async (req, res, next) => {
    if (req.session.login == undefined) req.session.login = false;
    if (!req.session.login) {
        res.status(404);
        if (req.accepts('html')) return res.render('404', {
            title: "404 - Not Found", 
            message: "The page you are looking for does not exist.", 
            owner: 'masDO1337' 
        });
        if (req.accepts('json')) return res.json({ error: 'Not Found' });
        res.type('txt').send('Not Found');
    }
    next();
};

module.exports = verify;