var onoff = require('../onoff'),
    ledGpio = 17,
    nextLedState = 1;

onoff.exp(ledGpio, function (err) {
    onoff.direction(ledGpio, 'out', function (err) {
        setInterval(function() {
            onoff.value(ledGpio, nextLedState);
            nextLedState = nextLedState === 1 ? 0 : 1;
        }, 200);
    });
});

