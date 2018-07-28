"use strict";

// Test for https://github.com/fivdi/onoff/issues/87
//
// If a Gpio is instantiated for an output GPIO and the edge parameter is
// specified then the edge parameter should be ignored. Attempting to write
// the sysfs edge file for an output GPIO results in an
// "EIO: i/o error, write"

const Gpio = require('../onoff').Gpio;
const assert = require('assert');

const ensureGpio17Unexported = (cb) => {
  let led = new Gpio(17, 'out');

  led.unexport();

  setTimeout(() => cb(), 100);
}

ensureGpio17Unexported(() => {
  let led;

  assert.doesNotThrow(
    () => led = new Gpio(17, 'out', 'both'),
    'can\'t instantiate a Gpio for an output with edge option specified'
  );

  led.unexport();

  console.log('ok - ' + __filename);
});

