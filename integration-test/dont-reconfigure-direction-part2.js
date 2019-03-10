'use strict';

/*
 * In this test, GPIO7 is connected to one end of a 1kΩ current limiting
 * resistor and GPIO8 is connected to the other end of the resistor.
 *
 * This test is part 2 of a two part test.
 * For part 1 see dont-reconfigure-direction-part1.js.
 *
 * Part 1 sets the ouput to 1 and expects to read 1 on the input. Part 1
 * doesn't unexport the GPIOs so that part 2 can can ensure that a Gpio output
 * object can be constructed without modifying the value of the output. Part 2
 * also expects to read one on the input. This is achieved by using the
 * reconfigureDirection option.
 */
const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const input = new Gpio(7, 'in');
const output = new Gpio(8, 'out', {reconfigureDirection: false});

assert(input.readSync() === 1);
assert(output.readSync() === 1);

input.unexport();
output.unexport();

console.log('ok - ' + __filename);

