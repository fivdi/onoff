var Gpio = require('../onoff').Gpio,
    ledGpio = new Gpio(/* 38 */ 17, 'out'),
    nextLedState = 0,
    iv;

iv = setInterval(function() {
    ledGpio.writeSync(nextLedState);
    nextLedState = nextLedState === 1 ? 0 : 1;
}, 100);

setTimeout(function() {
    clearInterval(iv);
    ledGpio.writeSync(0);
    ledGpio.unexport();
}, 2000);

