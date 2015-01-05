"use strict";

var Gpio = require('../onoff').Gpio,
    assert = require('assert'),
    input = new Gpio(18, 'in', 'rising');

assert(input.direction() === 'in');
assert(input.edge() === 'rising');

input.unexport();

console.log('ok - ' + __filename);

