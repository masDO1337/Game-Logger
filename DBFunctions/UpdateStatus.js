const UserModel = require('../DBModels/User');
const log = require("../Logger");

async function updateStatus(presence) {
    //console.log(`Updating status for user ${presence.user.tag} to ${presence.status}`);
    let userData = await UserModel.findOne({ userId: presence.userId });
    if (userData) {
        const status = presence.status;
        const prevStatus = userData.status;

        if (status === prevStatus) return;

        const validStatuses = ["online", "idle", "dnd", "offline"];
        
        if (!validStatuses.includes(status)) {
            log.error(`Failed to update status for user ${presence.user.tag} Error: not valid status: ${status}`);
            return;
        }

        const timestamp = Date.now();

        // Update timestamps
        if (userData.lastStatusChange) {
            const timeDiff = Math.floor((timestamp - userData.lastStatusChange) / 1000);
            userData.statusTimes[prevStatus] = (userData.statusTimes[prevStatus] || 0) + timeDiff;
        }

        // Calculate total time
        const totalTime = Object.values(userData.statusTimes).reduce((sum, time) => sum + time, 0);

        // Update percentages
        if (totalTime > 0) {
            validStatuses.forEach(s => {
                userData.statusPercentages[s] = Math.round(((userData.statusTimes[s] || 0) / totalTime) * 100);
            });
        }

        // Prevent overflow: if totalTime grows too large, scale all stored times down proportionally
        const MAX_TOTAL = 86400000;
        if (totalTime > MAX_TOTAL) {
            const scale = totalTime / MAX_TOTAL;
            validStatuses.forEach(s => {userData.statusTimes[s] = Math.max(0, Math.floor((userData.statusTimes[s] || 0) / scale))});
        }

        userData.status = status;
        userData.lastStatusChange = timestamp;

        try {
            await userData.save();
            log(`Updated User: ${presence.user.tag} status: ${prevStatus} -> ${status}`);
        } catch (error) {
            log.error(`Failed to update status for user ${presence.user.tag} Error: ${error}`);
        }
    } else log.error(`Failed to find database entry for user ${presence.user.tag}`);
}
module.exports = updateStatus;