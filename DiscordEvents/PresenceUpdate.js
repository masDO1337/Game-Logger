const { Events } = require('discord.js');
const updateActivities = require('../DBFunctions/UpdateActivities.js');
const updateStatus = require('../DBFunctions/UpdateStatus.js');

// simple in-memory dedupe cache to avoid processing the same user's presence update multiple times
// when the bot and user share multiple guilds (events can be emitted per guild)
const recentPresence = new Map();

module.exports = {
    name: Events.PresenceUpdate,
    once: false,
    async execute(oldPresence, newPresence) {
        if (newPresence.user.bot) return; // skip bots
        //console.log(`Presence update for user ${newPresence.user.tag} - old:${oldPresence?.status} new:${newPresence.status}`);
        
        // compute a simple signature of current activities (only names for type 0), sorted for stability
        const userId = newPresence.userId || newPresence.user?.id;

        const newSignature = JSON.stringify(
            (newPresence.activities || [])
                .filter(a => a.type === 0)
                .map(a => a.name)
                .sort()
        );

        const signature = newPresence.status + newSignature;

        // if we've processed the same signature recently for this user, ignore duplicate events
        if (userId && recentPresence.get(userId) === signature) return;

        if (userId) {
            recentPresence.set(userId, signature);
            // clear after a short interval to allow future legitimate updates
            setTimeout(() => {
                if (recentPresence.get(userId) === signature) recentPresence.delete(userId);
            }, 2000);
        }
        
        await updateActivities(newPresence);

        if (oldPresence?.status !== newPresence.status) {
          await updateStatus(newPresence);
        }
    }
};