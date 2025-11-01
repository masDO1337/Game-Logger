const GameModel = require('../DBModels/Game');

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
        console.log(`Failed to fetch app for game ID ${game.id}: ${resapp.status}`);
        return null;
    }
    return await resapp.json();
}

async function updateGame(userId, game, ifNameOnly = false) {

    let gameData = null;

    if (!game.applicationId) {
        console.log("No application ID", game);
        return;
    }

    if (ifNameOnly) {
        gameData = await GameModel.findOne({ name: game.name });
    } else {
        gameData = await GameModel.findOne({ id: game.applicationId });
    }

    if (!gameData) {
        let body = {
            id: game.applicationId,
            name: game.name,
            users: [{ userId, start: game.start, stop: game.stop, createdAt: game.createdAt}],
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
            console.log(`Created database entry for game ${game.name}`);
        } else {
            console.log(`Failed to create database entry for game ${game.name}`);
        }
    } else {

        if (game.name !== gameData.name) {
            console.log(`DB Game: ${gameData.name} no macth ${game.name}`);
            return await updateGame(userId, game, true);
        }

        const index = gameData.users.findIndex(a => a.userId === userId);

        if (index === -1) {
            gameData.users.push({userId, start: game.start, stop: game.stop, createdAt: game.createdAt});
        } else {
            gameData.users[index].start = game.start;
            gameData.users[index].stop = game.stop;
        }

        try {
            if (!await gameData.save()) {
                console.log(`Failed to update users for game ${gameData.name}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

}

module.exports = updateGame;