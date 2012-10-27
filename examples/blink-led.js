var onoff = require('../onoff'),
    ledGpio = 17,
    nextLedState = 1;

onoff.configure(ledGpio, 'out', function (err) {
    if (err) throw err;

    setInterval(function() {
        onoff.value(ledGpio, nextLedState);
        nextLedState = nextLedState === 1 ? 0 : 1;
    }, 200);
});

