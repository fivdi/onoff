var onoff = require('../onoff'),
    assert = require('assert'),
    ledPin = 17,
    nextLedState = 1;

function configureLedPin(callback) {
    onoff.exp(ledPin, function (err) {
        if (err) throw err;
        onoff.direction(ledPin, 'out', function (err) {
            if (err) throw err;
            callback();
        });
    });
};

function blinkLed() {
    var iv = setInterval(function() {
        onoff.value(ledPin, nextLedState);
        nextLedState = nextLedState === 1 ? 0 : 1;
    }, 100);

    setTimeout(function () {
        clearInterval(iv);
        onoff.value(ledPin, 0, function () {
            onoff.unexp(ledPin, function (err) {
                if (err) throw err;
            });
        });
    }, 2000);
};

configureLedPin(blinkLed);

