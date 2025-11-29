const fs = require("node:fs");
const log = require("./Logger");
const path = require("node:path");
const mongoose = require("mongoose");
const { Client, Collection, REST, Routes, Events, GatewayIntentBits } = require("discord.js");

// logging setup
global.logs = [];

require("dotenv").config();

const app = require("./web-server.js");

global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

global.client.commands = new Collection();
let commandsData = [];

const commandsPath = path.join(__dirname, "DiscordCommands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        global.client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
    } else {
        log.warning(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load Discord bot events conditionally

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

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// Sartup all services

// Start the Express server after the Discord client is ready
global.client.on(Events.ClientReady, async () => {
    log(`Logged in as ${global.client.user.tag}`);
    if (global.client.commands.size !== 0) {
        log(`Registering ${global.client.commands.size} slash commands.`);
        try {
            await rest.put(Routes.applicationCommands(global.client.user.id), {
                body: commandsData,
            });
            log("Successfully registered application commands globally.");
        } catch (error) {
            log.error(`Error registering application commands: ${error}`);
        }
    }
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
