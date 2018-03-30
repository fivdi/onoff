"use strict";

const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const input = new Gpio(4, 'in', 'rising');

assert(input.direction() === 'in');
assert(input.edge() === 'rising');

input.unexport();

console.log('ok - ' + __filename);

