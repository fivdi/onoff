var onoff = require('../onoff'),
    assert = require('assert'),
    inputGpio = 18;

function configureInput(callback) {
    onoff.exp(inputGpio, function (err) {
        if (err) throw err;
        onoff.direction(inputGpio, 'in', function (err) {
            if (err) throw err;
            onoff.edge(inputGpio, 'rising', function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

function checkInputConfiguration(callback) {
    onoff.direction(inputGpio, function (err, direction) {
        if (err) throw err;
        assert(direction === 'in');
        onoff.edge(inputGpio, function (err, edge) {
            if (err) throw err;
            assert(edge === 'rising');
            onoff.unexp(inputGpio, function (err) {
                if (err) throw err;
                callback();
            });
        });
    });
};

configureInput(function () {
    console.info('Input GPIO configured.');
    checkInputConfiguration(function () {
        console.info('Input GPIO configuration successfully verified.');
    });
});

