"use strict";

// Test for https://github.com/fivdi/onoff/issues/87
//
// If a Gpio is instantiated for an output GPIO and the edge parameter is
// specified then the edge parameter should be ignored. Attempting to write
// the sysfs edge file for an output GPIO results in an
// "EIO: i/o error, write"

var Gpio = require('../onoff').Gpio,
  assert = require('assert');

function ensureGpio17Unexported(cb) {
  var led = new Gpio(17, 'out');

  led.unexport();

  setTimeout(function () {
    cb();
  }, 100);
}

ensureGpio17Unexported(function () {
  var led;

  assert.doesNotThrow(
    function () {
      led = new Gpio(17, 'out', 'both');
    },
    'can\'t instantiate a Gpio for an output with edge option specified'
  );

  led.unexport();

  console.log('ok - ' + __filename);
});

