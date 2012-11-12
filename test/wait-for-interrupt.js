var Gpio = require('../onoff').Gpio,
    assert = require('assert'),
    button = new Gpio(/* 117 */ 18, 'in', 'both');

assert(button.direction() === 'in');
assert(button.edge() === 'both');

console.info('Input GPIO configured.');
console.info('Waiting for interrupt...');
console.info('Please press button attached to GPIO #18...');

button.watch(function(err, value) {
    if (err) throw err;

    console.info('There was an interrupt (GPIO value was ' + value + ').');

    assert(value === 0 || value === 1);

    button.unexport();

    console.log('ok - ' + __filename);
});

