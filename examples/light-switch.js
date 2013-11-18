var Gpio = require('../onoff').Gpio,
    led = new Gpio(17, 'out'), // 38
    button = new Gpio(18, 'in', 'both'); // 117

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    led.unexport();
    button.unexport();
    process.exit();
}

process.on('SIGINT', exit);

