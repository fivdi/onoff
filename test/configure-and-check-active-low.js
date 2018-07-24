"use strict";

/*
 * In this test, GPIO7 is connected to one end of a 1kΩ current limiting
 * resistor and GPIO8 is connected to the other end of the resistor.
 */
const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const input = new Gpio(7, 'in');
const output = new Gpio(8, 'out', {activeLow: true});

assert(input.activeLow() === false);
assert(output.activeLow() === true);

assert(input.readSync() === 0);
assert(output.readSync() === 1);

output.writeSync(0);
assert(input.readSync() === 1);
assert(output.readSync() === 0);
output.writeSync(1);
assert(input.readSync() === 0);
assert(output.readSync() === 1);

output.setActiveLow(false);
assert(input.activeLow() === false);
assert(output.activeLow() === false);
output.writeSync(0);
assert(input.readSync() === 0);
assert(output.readSync() === 0);
output.writeSync(1);
assert(input.readSync() === 1);
assert(output.readSync() === 1);

input.setActiveLow(true);
assert(input.activeLow() === true);
assert(output.activeLow() === false);
output.writeSync(0);
assert(input.readSync() === 1);
assert(output.readSync() === 0);
output.writeSync(1);
assert(input.readSync() === 0);
assert(output.readSync() === 1);

input.unexport();
output.unexport();

console.log('ok - ' + __filename);

