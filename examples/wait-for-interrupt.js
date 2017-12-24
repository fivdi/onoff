"use strict";

var Gpio = require('../onoff').Gpio,  // Constructor function for Gpio objects.
  button = new Gpio(4, 'in', 'both'); // Export GPIO4 as an interrupt
                                      // generating input.

console.log('Please press the button on GPIO4...');

// The callback passed to watch will be called when the button on GPIO4 is
// pressed. 
button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  console.log('Button pressed!, its value was ' + value);

  button.unexport(); // Unexport GPIO and free resources
});

