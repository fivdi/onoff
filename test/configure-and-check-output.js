var Gpio = require('../onoff').Gpio,
    assert = require('assert'),
    outputGpio = new Gpio(/* 38 */ 17, 'out');

console.info('Output GPIO configured.');

assert(outputGpio.direction() === 'out');

outputGpio.writeSync(1);
assert(outputGpio.readSync() === 1);

outputGpio.writeSync(0);
assert(outputGpio.readSync() === 0);

outputGpio.write(1, function(err) {
    if (err) throw err;
    outputGpio.read(function(err, value) {
        if (err) throw err;
        assert(value === 1);

        outputGpio.writeSync(0);
        assert(outputGpio.readSync() === 0);

        outputGpio.unexport();
        console.info('Output GPIO configuration successfully verified.');
    });
})

