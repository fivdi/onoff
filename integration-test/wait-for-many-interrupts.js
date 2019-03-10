'use strict';

const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const button = new Gpio(4, 'in', 'rising', {
  debounceTimeout : 10
});
let count = 0;

assert(button.direction() === 'in');
assert(button.edge() === 'rising');

console.info('Please press button connected to GPIO4 5 times...');

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  count += 1;

  console.log('button pressed ' + count + ' times, value was ' + value);

  if (count === 5) {
    button.unexport();
    console.log('ok - ' + __filename);
  }
});

