var onoff = require('../onoff'),
    assert = require('assert'),
    inputPin = 18;

function configureInput(callback) {
    onoff.exp(inputPin, function (err) {
        if (err) throw err;
        onoff.direction(inputPin, 'in', function (err) {
            if (err) throw err;
            onoff.edge(inputPin, 'both', function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function waitForInterrupt(callback) {
    onoff.watch(inputPin, function (err, value) {
        if (err) throw err;
        onoff.unexp(inputPin, function (err) {
            if (err) throw err;
            assert(value === 0 || value === 1);
            callback(value);
        });
    })
};

configureInput(function () {
    console.info('Input pin configured.');
    console.info('Waiting for interrupt...');
    console.info('Please press button attached to pin ' + inputPin + '...');
    waitForInterrupt(function (value) {
        console.info('There was an interrupt (pin value was ' + value + ').');
    });
});

