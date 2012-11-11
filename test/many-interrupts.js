var assert = require('assert'),
    Gpio = require('../onoff').Gpio,
    ledGpio = new Gpio(/* 38 */ 17, 'out', 'both'),
    ledStateChanges = 0,
    falling = 0,
    rising = 0;

function interrupt(err, value) {
    if (err) throw err;

    if (value === 1) {
        rising += 1;
    } else if (value === 0) {
        falling += 1;
    }

    assert(ledGpio.readSync() === value);

    if (rising + falling < 2000) {
        ledGpio.watch(interrupt);
        toggleLedState();
    } else {
        assert(ledStateChanges === 2000);
        assert(rising === falling);
        assert(rising + falling === ledStateChanges);

        ledGpio.writeSync(0);
        ledGpio.unexport();
    }
}

function toggleLedState(wait) {
    ledGpio.writeSync(ledGpio.readSync() === 1 ? 0 : 1);
    ledStateChanges += 1;        
}

ledGpio.watch(interrupt);
setTimeout(function() {
    toggleLedState();
}, 1);

