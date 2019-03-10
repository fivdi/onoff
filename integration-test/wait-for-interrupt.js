'use strict';

const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const button = new Gpio(4, 'in', 'both');

assert(button.direction() === 'in');
assert(button.edge() === 'both');

console.info('Please press button connected to GPIO #4...');

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  assert(value === 0 || value === 1);

  button.unexport();

  console.log('ok - ' + __filename);
  console.log('     button pressed, value was ' + value);
});

