var assert = require('assert'),
    Gpio = require('../onoff').Gpio,
    led = new Gpio(/* 38 */ 17, 'out', 'both'),
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

    assert(led.readSync() === value);

    if (rising + falling < 2000) {
        toggleLedState();
    } else {
        assert(ledStateChanges === 2000);
        assert(rising === falling);
        assert(rising + falling === ledStateChanges);

        led.writeSync(0);
        led.unexport();

        console.log('ok - ' + __filename);
    }
}

function toggleLedState(wait) {
    led.writeSync(led.readSync() === 1 ? 0 : 1);
    ledStateChanges += 1;        
}

led.watch(interrupt);
toggleLedState();

