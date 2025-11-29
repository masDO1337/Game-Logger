const { SlashCommandBuilder, EmbedBuilder,  MessageFlags } = require("discord.js");
const UserModel = require("../DBModels/User");
const log = require("../Logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Show the history of what the user has palyed."),
  async execute(interaction) {
    const userId = interaction.user.id;
    //log(`Fetching game history for user ID: ${userId}`);
    const userData = await UserModel.findOne({ userId: userId });

    if (userData) {
      if (!userData.history || userData.history.length === 0)
        return interaction.reply({
          content: "No game history found for you.",
          flags: MessageFlags.Ephemeral,
        });
      
      const historyEmbed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Game History`)
        .setColor(0x00ae86)
        .setDescription("Here is a summary of your game history:")
        .setTimestamp();

      userData.history.sort((a, b) => ((b.h*3600)+(b.m*60)+b.s) - ((a.h*3600)+(a.m*60)+a.s)).forEach((game, index) => {
        const duration = new Date(game.stop) - new Date(game.start);
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        const lastPlayedString = `${hours}h ${minutes}m ${seconds}s`;
        const totalPlayTimeString = `${game.h}h ${game.m}m ${game.s}s`;

        historyEmbed.addFields({
          name: `${index + 1}. ${game.name}`,
          value: `**Last played:** ${lastPlayedString}\n**Total play time:** ${totalPlayTimeString}`,
        });
      });

      return interaction.reply({ embeds: [historyEmbed] });
    } else {
      return interaction.reply({
        content: "Not found you.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
