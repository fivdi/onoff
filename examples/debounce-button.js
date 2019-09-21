'use strict';

const Gpio = require('../onoff').Gpio;
const led = new Gpio(17, 'out');
const button = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  led.writeSync(led.readSync() ^ 1);
});

process.on('SIGINT', _ => {
  led.unexport();
  button.unexport();
});

