const express = require('express');
const log = require("../Logger");
const router = express.Router();

// Middleware to verify user is logged in
const verify = require("../Middleware/verify");
router.use(verify);

function eventHead(res, interval) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    //the following 2 lines were added for IE support: 2kb padding, and a retry param
    res.write(':' + (new Array(2049)).join(' ') + '\n');
    res.write('retry: 2000\n');

    //clear interval when the client stops listening
    res.on('close', function() {
        clearInterval(interval);
        //console.log('Client stopped listening');
    });
};

router.get('/logs', (req, res) => {

    let oldLog = [];

    if (global.logs && global.logs.length > 0) {
      oldLog = [...global.logs];
    }

    eventHead(res, setInterval(() => {
        if (global.logs && global.logs.length > 0) {
            let newLogs = global.logs.filter((item) => !oldLog.includes(item));
            if (newLogs.length > 0) {
                oldLog = [...global.logs];
                newLogs.forEach(log => res.write(`data: ${JSON.stringify(log)}\n\n`));
            }
        }
    }, 1000));
    
});

module.exports = {
    path: '/events',
    router: router
};