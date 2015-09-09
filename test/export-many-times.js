"use strict";

var Gpio = require('../onoff').Gpio,
  led,
  i;

for (i = 1; i <= 1000000; i += 1) {
  led = new Gpio(17, 'out');
  led.writeSync(led.readSync() ^ 1);
  led.unexport();
  if (i % 10 === 0) {
    console.log(i);
  }
}

console.log('ok - ' + __filename);

