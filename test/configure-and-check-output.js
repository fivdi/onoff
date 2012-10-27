var onoff = require('../onoff'),
    assert = require('assert'),
    outputGpio = 17;

function configureOutput(callback) {
    onoff.exp(outputGpio, function (err) {
        if (err) throw err;
        onoff.direction(outputGpio, 'out', function (err) {
            if (err) throw err;
            onoff.value(outputGpio, 1, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function checkOutputConfiguration(callback) {
    onoff.direction(outputGpio, function (err, direction) {
        if (err) throw err;
        assert(direction === 'out');
        onoff.value(outputGpio, function (err, value) {
            if (err) throw err;
            assert(value === 1);
            onoff.unexp(outputGpio, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

configureOutput(function () {
    console.info('Output GPIO configured.');
    checkOutputConfiguration(function () {
        console.info('Output GPIO configuration successfully verified.');
    });
});

