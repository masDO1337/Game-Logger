const GameModel = require('../DBModels/Game')

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
        console.log(`Failed to fetch app for game ID ${id}: ${resapp.status}`);
        return null;
    }
    return await resapp.json();
}

async function fixGameDB() {
    // fix games in database update games with new icons
    const games = await GameModel.find();
    await games.forEach(async (game) => {
        const app = await getApplication(game.id);
        if (app) {
            if (!game.icon && game.icon !== app.icon) game.icon = app.icon || '';
            if (!game.description && game.description !== app.description) game.description = app.description;
            if (!game.cover_image && game.cover_image !== app.cover_image) game.cover_image = app.cover_image || '';
            if (!game.splash && game.splash !== app.splash) game.splash = app.splash || '';
            if (!game.iconURL) game.iconURL = app.icon ? `https://cdn.discordapp.com/app-icons/${game.id}/${app.icon}.png` : '';
            if (!game.cover_imageURL) game.cover_imageURL = app.cover_image ? `https://cdn.discordapp.com/app-icons/${game.id}/${app.cover_image}.png` : '';
            if (!game.splashURL) game.splashURL = app.splash ? `https://cdn.discordapp.com/app-icons/${game.id}/${app.splash}.png` : '';
        }
        try {
            await game.save();
            console.log(`Updated game ${game.name} with latest application data.`);
        } catch (error) {
            console.error(`Failed to update game: ${game.name}`, error);
        }
    });
}

module.exports = fixGameDB;