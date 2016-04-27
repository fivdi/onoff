"use strict";

var assert = require('assert'),
  Gpio = require('../onoff').Gpio,
  input = new Gpio(7, 'in', 'both'),
  output = new Gpio(8, 'out'),
  toggleCount = 0,
  falling = 0,
  rising = 0;

function toggleOutput() {
  output.writeSync(output.readSync() ^ 1);
  toggleCount += 1;
}

function interrupt(err, value) {
  if (err) {
    throw err;
  }

  if (value === 1) {
    rising += 1;
  } else if (value === 0) {
    falling += 1;
  }

  assert(output.readSync() === value);

  if (rising + falling < 2000) {
    toggleOutput();
  } else {
    assert(toggleCount === 2000);
    assert(rising === falling);
    assert(rising + falling === toggleCount);

    input.unexport();
    output.writeSync(0);
    output.unexport();

    console.log('ok - ' + __filename);
  }
}

input.watch(interrupt);
toggleOutput();

