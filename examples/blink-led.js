"use strict";

const Gpio = require('../onoff').Gpio; // Gpio class
const led = new Gpio(17, 'out');       // Export GPIO17 as an output

// Toggle the state of the LED connected to GPIO17 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
const iv = setInterval(function () {
  led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off :)
}, 200);

// Stop blinking the LED and turn it off after 5 seconds
setTimeout(function () {
  clearInterval(iv); // Stop blinking
  led.writeSync(0);  // Turn LED off
  led.unexport();    // Unexport GPIO and free resources
}, 5000);

