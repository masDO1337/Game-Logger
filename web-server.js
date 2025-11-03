const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: process.env.TOKEN, resave: false, saveUninitialized: false }));

const routesPath = path.join(__dirname, 'Routes');
const routeFiles = fs.readdirSync(routesPath).filter((file) => file.endsWith('.js'));
for (const file of routeFiles) {
    const filePath = path.join(routesPath, file);
    const router = require(filePath);
    app.use(router.path, router.router);
}

// 404 handler
app.use((req, res, next) => {
    res.status(404);
    if (req.accepts('html')) return res.render('404', {
        title: "404 - Not Found", 
        message: "The page you are looking for does not exist.", 
        owner: 'masDO1337' 
    });
    if (req.accepts('json')) return res.json({ error: 'Not Found' });
    res.type('txt').send('Not Found');
});

module.exports = app;