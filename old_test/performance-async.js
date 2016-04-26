"use strict";

(function (loops) {
  var Gpio = require('../onoff').Gpio,
    led = new Gpio(17, 'out'),
    time = process.hrtime(),
    hertz;

  (function next(i) {
    if (i >= 0) {
      led.write(1, function (err) {
        if (err) {
          throw err;
        }

        led.write(0, function (err) {
          if (err) {
            throw err;
          }

          next(i - 1);
        });
      });
    } else {
      time = process.hrtime(time);
      hertz = Math.floor(loops / (time[0] + time[1] / 1E9));

      led.unexport();

      console.log('ok - ' + __filename);
      console.log('     async frequency = ' + hertz / 1000 + 'KHz');
    }
  }(loops));
}(4000));

