const UserModel = require('../DBModels/User');

async function updateStatus(presence) {
    //console.log(`Updating status for user ${presence.user.tag} to ${presence.status}`);
    return; // Disabled for now
    const status = presence.status;

    let userData = await UserModel.findOne({ userId: presence.userId });
    if (userData) {
        if (userData.status !== status) {
            userData.status = status;
            userData.statusSince = new Date();
            userData.statusDurationMs = 0;
        } else {
            const since = userData.statusSince ? new Date(userData.statusSince).getTime() : Date.now();
            userData.statusDurationMs = Date.now() - since;
        }
        try {
            if (!await userData.save()) {
                console.log(`Failed to update activities for user ${presence.user.tag}`);
            }
        } catch (error) {
            console.error(error);
        }
    } else console.log(`Failed to find database entry for user ${presence.user.tag}`);
}
module.exports = updateStatus;