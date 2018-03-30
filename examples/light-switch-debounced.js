"use strict";

var Gpio = require('../onoff').Gpio,
  led = new Gpio(17, 'out'),
  button = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});

button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  led.writeSync(led.readSync() ^ 1);
});

process.on('SIGINT', function () {
  led.unexport();
  button.unexport();
});

