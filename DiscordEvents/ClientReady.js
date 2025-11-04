const { Events } = require('discord.js');
const UserModel = require('../DBModels/User');
const updateActivities = require('../DBFunctions/UpdateActivities');
const fixGameDB = require('../DBFunctions/FixGameDB');
const log = require("../Logger");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// get all members from each guild and ensure they are in the database and update their activitys
		client.guilds.cache.forEach(async (guild) => {
			const members = await guild.members.fetch({ withPresences: true });

			for (const [memberId, member] of members) {
				if (member.user.bot) continue; // skip bots

				let userData = await UserModel.findOne({ userId: memberId });
				if (!userData) {
					if (await UserModel.create({ userId: memberId })) {
						log(`Created database entry for user ${member.user.tag}`);
					} else {
						log.error(`Failed to create database entry for user ${member.user.tag}`);
					}
				}

				if (member.presence) {
					updateActivities(member.presence);
				}
			}
		});

		if (true) return;
		await fixGameDB();
	}
};