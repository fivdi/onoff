'use strict';

/*
 * In this test, GPIO7 is connected to one end of a 1kΩ current limiting
 * resistor and GPIO8 is connected to the other end of the resistor.
 */
const Gpio = require('../onoff').Gpio;
const assert = require('assert');
let input = new Gpio(7, 'in');
let output = new Gpio(8, 'low', {activeLow: true});

assert(input.readSync() === 0);
assert(output.readSync() === 1);

input.unexport();
output.unexport();

//

input = new Gpio(7, 'in');
output = new Gpio(8, 'low', {activeLow: false});

assert(input.readSync() === 0);
assert(output.readSync() === 0);

input.unexport();
output.unexport();

//

input = new Gpio(7, 'in');
output = new Gpio(8, 'high', {activeLow: true});

assert(input.readSync() === 1);
assert(output.readSync() === 0);

input.unexport();
output.unexport();

//

input = new Gpio(7, 'in');
output = new Gpio(8, 'high', {activeLow: false});

assert(input.readSync() === 1);
assert(output.readSync() === 1);

input.unexport();
output.unexport();

//

input = new Gpio(7, 'in');
output = new Gpio(8, 'out', {activeLow: true});

assert(input.readSync() === 0);
assert(output.readSync() === 1);

input.unexport();
output.unexport();

//

input = new Gpio(7, 'in');
output = new Gpio(8, 'out', {activeLow: false});

assert(input.readSync() === 0);
assert(output.readSync() === 0);

input.unexport();
output.unexport();

console.log('ok - ' + __filename);

