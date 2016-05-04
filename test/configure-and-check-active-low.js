"use strict";

/*
 * In this test, GPIO #7 is wired to one end of a 1kΩ current limiting
 * resistor and GPIO #8 is wired to the other end of the resistor.
 */
var Gpio = require('../onoff').Gpio,
  assert = require('assert'),
  input = new Gpio(7, 'in'),
  output = new Gpio(8, 'out', {activeLow: true});

assert(input.activeLow() === false);
assert(output.activeLow() === true);
output.writeSync(0);
assert(input.readSync() === 1);
output.writeSync(1);
assert(input.readSync() === 0);

output.setActiveLow(false);
assert(input.activeLow() === false);
assert(output.activeLow() === false);
output.writeSync(0);
assert(input.readSync() === 0);
output.writeSync(1);
assert(input.readSync() === 1);

input.setActiveLow(true);
assert(input.activeLow() === true);
assert(output.activeLow() === false);
output.writeSync(0);
assert(input.readSync() === 1);
output.writeSync(1);
assert(input.readSync() === 0);

input.unexport();
output.unexport();

console.log('ok - ' + __filename);

