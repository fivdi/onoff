'use strict';

const Gpio = require('../onoff').Gpio;
const assert = require('assert');
const output = new Gpio(17, 'out');

assert(output.direction() === 'out');

output.writeSync(1);
assert(output.readSync() === 1);

output.writeSync(0);
assert(output.readSync() === 0);

output.write(1, (err) => {
  if (err) {
    throw err;
  }

  output.read((err, value) => {
    if (err) {
      throw err;
    }

    assert(value === 1);

    output.writeSync(0);
    assert(output.readSync() === 0);

    output.unexport();

    console.log('ok - ' + __filename);
  });
});

