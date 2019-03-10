'use strict';

const assert = require('assert');
const Gpio = require('../onoff').Gpio;

assert(Gpio.HIGH === 1, 'expected Gpio.HIGH to be 1');
assert(Gpio.LOW === 0, 'expected Gpio.LOW to be 0');

console.log('ok - ' + __filename);

