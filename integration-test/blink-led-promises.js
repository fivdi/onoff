'use strict';

const Gpio = require('../onoff').Gpio;
const led = new Gpio(17, 'out');
let stopBlinking = false;

const blinkLed = () => {
  if (stopBlinking) {
    led.unexport();
    console.log('ok - ' + __filename);
    return;
  }

  led.read()
    .then(value => led.write(value ^ 1))
    .then(_ => setTimeout(blinkLed, 50))
    .catch(err => {
      console.log(err);
    });
};

blinkLed();

setTimeout(_ => stopBlinking = true, 2000);


