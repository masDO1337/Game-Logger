const log = require("../Logger");
const { Events, MessageFlags } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const command = global.client.commands.get(interaction.commandName);

        if (!command) {
            log.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            log.error(`Error executing ${interaction.commandName}`);
            log.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
            }
        }
    },
};