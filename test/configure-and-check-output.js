var onoff = require('../onoff'),
    assert = require('assert'),
    outputPin = 17;

function configureOutput(callback) {
    onoff.exp(outputPin, function (err) {
        if (err) throw err;
        onoff.direction(outputPin, 'out', function (err) {
            if (err) throw err;
            onoff.value(outputPin, 1, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function checkOutputConfiguration(callback) {
    onoff.direction(outputPin, function (err, direction) {
        if (err) throw err;
        assert(direction === 'out');
        onoff.value(outputPin, function (err, value) {
            if (err) throw err;
            assert(value === 1);
            onoff.unexp(outputPin, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

configureOutput(function () {
    console.info('Output pin configured.');
    checkOutputConfiguration(function () {
        console.info('Output pin configuration successfully verified.');
    });
});

