var onoff = require('../onoff'),
    assert = require('assert'),
    ledGpio = 17,
    nextLedState = 1;

function configureLedGpio(callback) {
    onoff.exp(ledGpio, function (err) {
        if (err) throw err;
        onoff.direction(ledGpio, 'out', function (err) {
            if (err) throw err;
            callback();
        });
    });
};

function blinkLed() {
    var iv = setInterval(function() {
        onoff.value(ledGpio, nextLedState);
        nextLedState = nextLedState === 1 ? 0 : 1;
    }, 100);

    setTimeout(function () {
        clearInterval(iv);
        onoff.value(ledGpio, 0, function () {
            onoff.unexp(ledGpio, function (err) {
                if (err) throw err;
            });
        });
    }, 2000);
};

configureLedGpio(blinkLed);

