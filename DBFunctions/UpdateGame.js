const GameModel = require('../DBModels/Game');
const log = require('../Logger');

async function getApplication(id) {
    const url = `https://discord.com/api/v10/applications/${id}/rpc`;
    const resapp = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${process.env.TOKEN}`,
            "User-Agent": "DiscordBot (bot.gh4g.lt, v1.0)"
        }
    }).catch(reason =>{
        console.log(reason)
    });

    if (!resapp.ok) {
        log.error(`Failed to fetch app for game ID ${game.id}: ${resapp.status}`);
        return null;
    }
    return await resapp.json();
}

async function updateGame(userId, game, findByName = false) {

    if (!game.applicationId) {
        log.error("No application ID", game);
        return;
    }

    if (game.applicationId === "438122941302046720") {
        log.warning(`Application ID is Xbox, Set find by name ${game.name}`);
        findByName = true;
    }

    let gameData = null;

    if (findByName) {
        gameData = await GameModel.findOne({ name: game.name });
    } else {
        gameData = await GameModel.findOne({ id: game.applicationId });
    }

    if (!gameData) {
        let body = {
            id: game.applicationId,
            name: game.name,
            users: [{ 
                userId, 
                start: game.start, 
                stop: game.stop, 
                createdAt: game.createdAt, 
                h: game.h, 
                m: game.m, 
                s: game.s 
            }]
        };

        const app = await getApplication(game.applicationId);

        if (app) {
            body.description = app.description;
            body.icon = app.icon || '';
            body.cover_image = app.cover_image || '';
            body.splash = app.splash || '';
            body.iconURL = app.icon ? `https://cdn.discordapp.com/app-icons/${game.applicationId}/${app.icon}.png` : '';
            body.cover_imageURL = app.cover_image ? `https://cdn.discordapp.com/app-icons/${game.applicationId}/${app.cover_image}.png` : '';
            body.splashURL = app.splash ? `https://cdn.discordapp.com/app-icons/${game.applicationId}/${app.splash}.png` : '';
            if (app.name && app.name === 'Xbox') body.iconURL = "https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg";
        }

        if (await GameModel.create(body)) {
            log(`Created database entry for game ${game.name}`);
        } else {
            log.error(`Failed to create database entry for game ${game.name}`);
        }

    } else {

        if (game.name !== gameData.name) {
            log.warning(`DB Game: ${gameData.name} no macth, Set find by name ${game.name}`);
            return await updateGame(userId, game, true);
        }

        const index = gameData.users.findIndex(a => a.userId === userId);

        if (index === -1) {
            gameData.users.push({ 
                userId, 
                start: game.start, 
                stop: game.stop, 
                createdAt: game.createdAt, 
                h: game.h, 
                m: game.m, 
                s: game.s 
            });
        } else {
            gameData.users[index].start = game.start;
            gameData.users[index].stop = game.stop;
            gameData.users[index].h = game.h;
            gameData.users[index].m = game.m;
            gameData.users[index].s = game.s;
        }

        try {
            await gameData.save();
            log(`Updated database entry for game ${gameData.name}`);
        } catch (error) {
            log.error(`Failed to update database entry for game ${gameData.name}: ${error}`);
        }
    }

}

module.exports = updateGame;