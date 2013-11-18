var Gpio = require('../onoff').Gpio,
    led = new Gpio(/* 38 */ 17, 'out'),
    nextLedState = 0,
    iv;

iv = setInterval(function() {
    led.writeSync(nextLedState);
    nextLedState = nextLedState === 1 ? 0 : 1;
}, 100);

setTimeout(function() {
    clearInterval(iv);
    led.writeSync(0);
    led.unexport();

    console.log('ok - ' + __filename);
}, 2000);

