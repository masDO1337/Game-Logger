const fs = require("node:fs");
const log = require("./Logger");
const path = require("node:path");
const mongoose = require("mongoose");
const { Client, Events, GatewayIntentBits } = require("discord.js");

// logging setup
global.logs = [];

require("dotenv").config();

const app = require("./web-server.js");

global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

if (process.env.LOAD_BOT_EVENTS === "true") {
    const eventsPath = path.join(__dirname, "DiscordEvents");
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            global.client.once(event.name, (...args) => event.execute(...args));
        } else {
            global.client.on(event.name, (...args) => event.execute(...args));
        }
    }
} else {
    log("Skipping loading Discord bot events as per configuration.");
}

// Sartup all services

// Start the Express server after the Discord client is ready
global.client.on(Events.ClientReady, () => {
    log(`Logged in as ${global.client.user.tag}`);
    app.listen(process.env.PORT, () => {
        log(`Express server listening on port ${process.env.PORT}`);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    log("Connected to MongoDB");
    // Start the Discord bot after successful DB connection
    global.client.login(process.env.TOKEN);
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});
