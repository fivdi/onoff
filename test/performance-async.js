"use strict";

const Gpio = require('../onoff').Gpio;
const led = new Gpio(17, 'out');

(function (loops) {
  let time = process.hrtime();

  (function next(i) {
    if (i >= 0) {
      led.write(1, (err) => {
        if (err) {
          throw err;
        }

        led.write(0, (err) => {
          if (err) {
            throw err;
          }

          next(i - 1);
        });
      });
    } else {
      time = process.hrtime(time);
      const hertz = Math.floor(loops / (time[0] + time[1] / 1E9));

      led.unexport();

      console.log('ok - ' + __filename);
      console.log('     async frequency = ' + hertz / 1000 + 'KHz');
    }
  }(loops));
}(4000));

