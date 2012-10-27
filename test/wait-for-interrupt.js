var onoff = require('../onoff'),
    assert = require('assert'),
    inputGpio = 18;

function configureInput(callback) {
    onoff.exp(inputGpio, function (err) {
        if (err) throw err;
        onoff.direction(inputGpio, 'in', function (err) {
            if (err) throw err;
            onoff.edge(inputGpio, 'both', function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function waitForInterrupt(callback) {
    onoff.watch(inputGpio, function (err, value) {
        if (err) throw err;
        onoff.unexp(inputGpio, function (err) {
            if (err) throw err;
            assert(value === 0 || value === 1);
            callback(value);
        });
    })
};

configureInput(function () {
    console.info('Input GPIO configured.');
    console.info('Waiting for interrupt...');
    console.info('Please press button attached to GPIO ' + inputGpio + '...');
    waitForInterrupt(function (value) {
        console.info('There was an interrupt (GPIO value was ' + value + ').');
    });
});

