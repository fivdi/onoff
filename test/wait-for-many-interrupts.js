"use strict";

var Gpio = require('../onoff').Gpio,
  assert = require('assert'),
  button = new Gpio(4, 'in', 'rising', {
    debounceTimeout : 250
  }),
  count = 0;

assert(button.direction() === 'in');
assert(button.edge() === 'rising');
assert(button.options().debounceTimeout === 250);

console.info('Please press button attached to GPIO #4 5 times...');

button.watch(function (err, value) {
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

