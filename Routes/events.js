const express = require('express');
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

    let oldLog = null;

    if (global.logs && global.logs.length > 0) {
      oldLog = JSON.stringify(global.logs[global.logs.length - 1]);
    }

    eventHead(res, setInterval(() => {
        if (global.logs && global.logs.length > 0) {
            const log = JSON.stringify(global.logs[global.logs.length - 1]);
            if (log === oldLog) return;
            oldLog = log;
            res.write(`data: ${log}\n\n`);
        }
    }, 1000));
    
});

module.exports = {
    path: '/events',
    router: router
};