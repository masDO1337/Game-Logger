function log(message) {
    if (!global.logs) return;

    const timestamp = new Date();
    global.logs.push({ timestamp: timestamp.toISOString(), message });
    console.log(`[${timestamp.toLocaleString('lt-LT')}] ${message}`);

    // Keep only the latest 100 logs
    if (global.logs.length > 100) {
        global.logs.shift();
    }
}

module.exports = log;
