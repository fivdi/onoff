"use strict";

const Gpio = require('../onoff').Gpio; // Gpio class
const led = new Gpio(17, 'out');       // Export GPIO17 as an output
let stopBlinking = false;

// Toggle the state of the LED connected to GPIO17 every 200ms.
// Here asynchronous methods are used. Synchronous methods are also available.
const blinkLed = () => {
  if (stopBlinking) {
    return led.unexport();
  }

  led.read((err, value) => { // Asynchronous read
    if (err) {
      throw err;
    }

    led.write(value ^ 1, (err) => { // Asynchronous write
      if (err) {
        throw err;
      }
    });
  });

  setTimeout(blinkLed, 200);
};

blinkLed();

setTimeout(() => stopBlinking = true, 5000);

