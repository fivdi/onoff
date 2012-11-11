var Gpio = require('../onoff').Gpio,
    assert = require('assert'),
    inputGpio = new Gpio(/* 117 */ 18, 'in', 'rising');

console.info('Input GPIO configured.');

assert(inputGpio.direction() === 'in');
assert(inputGpio.edge() === 'rising');

inputGpio.unexport();

console.info('Input GPIO configuration successfully verified.');

