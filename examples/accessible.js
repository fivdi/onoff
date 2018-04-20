"use strict";

const Gpio = require('../onoff').Gpio; // Gpio class

if(Gpio.accessible) {
  console.log('you got it');
} else {
  console.log('none for you');
}
