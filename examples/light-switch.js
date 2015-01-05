"use strict";

var Gpio = require('../onoff').Gpio,
    led = new Gpio(17, 'out'), // 38
    button = new Gpio(18, 'in', 'both'); // 117

function exit() {
    led.unexport();
    button.unexport();
    process.exit();
}

button.watch(function (err, value) {
    if (err) {
        exit();
    }

    led.writeSync(value);
});

process.on('SIGINT', exit);

