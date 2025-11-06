function log(message, type = 'log') {
    if (!global.logs) return;

    const timestamp = new Date();
    global.logs.push({ timestamp: timestamp.toISOString(), message, type });

    if (type === 'error') console.log(`[${timestamp.toLocaleString("lt-LT")}] \x1b[31m${message}\x1b[0m`);
    if (type === 'warning') console.log(`[${timestamp.toLocaleString("lt-LT")}] \x1b[33m${message}\x1b[0m`);
    else console.log(`[${timestamp.toLocaleString("lt-LT")}] ${message}`);

    // Keep only the latest 100 logs
    if (global.logs.length > 200) {
        global.logs.shift();
    }
}

module.exports = log;
module.exports.error = (message) => log(message, 'error');
module.exports.warning = (message) => log(message, "warning");
