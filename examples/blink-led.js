"use strict";

var Gpio = require('../onoff').Gpio, // Constructor function for Gpio objects.
  led = new Gpio(14, 'out'),         // Export GPIO #14 as an output.
  iv;

// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
iv = setInterval(function () {
  led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off :)
}, 200);

// Stop blinking the LED and turn it off after 5 seconds.
setTimeout(function () {
  clearInterval(iv); // Stop blinking
  led.writeSync(0);  // Turn LED off.
  led.unexport();    // Unexport GPIO and free resources
}, 5000);

