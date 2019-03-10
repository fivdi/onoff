'use strict';

const Gpio = require('../onoff').Gpio;
const led = new Gpio(17, 'out');

const iv = setInterval(() => led.writeSync(led.readSync() ^ 1), 100);

setTimeout(() => {
  clearInterval(iv);

  led.writeSync(0);
  led.unexport();

  console.log('ok - ' + __filename);
}, 2000);

