var onoff = require('../onoff'),
    assert = require('assert'),
    inputPin = 18;

function configureInput(callback) {
    onoff.exp(inputPin, function (err) {
        if (err) throw err;
        onoff.direction(inputPin, 'in', function (err) {
            if (err) throw err;
            onoff.edge(inputPin, 'rising', function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function checkInputConfiguration(callback) {
    onoff.direction(inputPin, function (err, direction) {
        if (err) throw err;
        assert(direction === 'in');
        onoff.edge(inputPin, function (err, edge) {
            if (err) throw err;
            assert(edge === 'rising');
            onoff.unexp(inputPin, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

configureInput(function () {
    console.info('Input pin configured.');
    checkInputConfiguration(function () {
        console.info('Input pin configuration successfully verified.');
    });
});

