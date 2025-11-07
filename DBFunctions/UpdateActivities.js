const UserModel = require('../DBModels/User');
const updateGame = require('./UpdateGame');
const log = require('../Logger');

async function updateActivities(presence) {

    // Filter only 'Playing' activities
    const activities = (presence.activities || [])
        .filter((a) => a.type === 0)
        .map((activity) => {
            return {
                name: activity.name,
                applicationId: activity.applicationId,
                start: new Date(activity.createdAt)
            };
        });

    let userData = await UserModel.findOne({ userId: presence.userId });
    if (userData) {

        // Update activities with start time from if existing in database
        activities.forEach((activity, index) => {
            userData.activities.forEach(a => {
                if (a.name === activity.name) activities[index].start = a.start;
            });
        });

        if (JSON.stringify(userData.activities) === JSON.stringify(activities)) return;

        let updateHistory = false;
        let updateHistoryEntry = { name: '', applicationId: null, start: null, stop: null, createdAt: null };

        // Check for started and stopped activities
        activities.forEach(activity => {
            if (!userData.activities.find(a => a.name === activity.name)) {
                log(`User ${presence.user.tag} started game: ${activity.name}`);
            }
        });

        userData.activities.forEach(activity => {
            if (!activities.find(a => a.name === activity.name)) {
                updateHistoryEntry = { ...activity._doc, stop: new Date()}
                updateHistory = true;
                log(`User ${presence.user.tag} stopped game: ${activity.name}`);
            }
        });

        if (updateHistory) {
            // Update history
            const elapsedSec = Math.floor((new Date(updateHistoryEntry.stop).getTime() - new Date(updateHistoryEntry.start).getTime()) / 1000);
            let h = Math.floor(elapsedSec / 3600);
            let m = Math.floor((elapsedSec % 3600) / 60);
            let s = elapsedSec % 60;

            const index = userData.history.findIndex(a => a.name === updateHistoryEntry.name);

            if (index === -1) {
                updateHistoryEntry.createdAt = updateHistoryEntry.start;
                updateHistoryEntry.h = h;
                updateHistoryEntry.m = m;
                updateHistoryEntry.s = s;

                userData.history.push({...updateHistoryEntry});
            } else {
                userData.history[index].start = updateHistoryEntry.start;
                userData.history[index].stop = updateHistoryEntry.stop;
                userData.history[index].s += s;
                userData.history[index].m += m + Math.floor(userData.history[index].s / 60); 
                userData.history[index].s %= 60; 
                userData.history[index].h += h + Math.floor(userData.history[index].m / 60);
                userData.history[index].m %= 60;

                updateHistoryEntry.createdAt = new Date();
                updateHistoryEntry.h = userData.history[index].h;
                updateHistoryEntry.m = userData.history[index].m;
                updateHistoryEntry.s = userData.history[index].s;
            }

            await updateGame(userData.userId, updateHistoryEntry);
        }

        userData.activities = activities;
        try {
            await userData.save();
        } catch (error) {
            log.error(`Failed to update activities for user ${presence.user.tag} Error: ${error}`);
        }
    } else log.error(`Failed to find database entry for user ${presence.user.tag}`);
}
module.exports = updateActivities;