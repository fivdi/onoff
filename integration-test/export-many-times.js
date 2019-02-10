"use strict";

const Gpio = require('../onoff').Gpio;

for (let i = 1; i <= 1000000; i += 1) {
  const led = new Gpio(17, 'out');
  led.writeSync(led.readSync() ^ 1);
  led.unexport();
  if (i % 10 === 0) {
    console.log(i);
  }
}

console.log('ok - ' + __filename);

