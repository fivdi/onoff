'use strict';

const Gpio = require('../onoff').Gpio;

const pulseLed = (led, pulseCount, cb) => {
  let time = process.hrtime();

  const loop = (count) => {
    if (count === 0) {
      time = process.hrtime(time);
      const writesPerSecond = pulseCount * 2 / (time[0] + time[1] / 1E9);
      return cb(null, writesPerSecond);
    }

    led.write(1, (err) => {
      if (err) {
        return cb(err);
      }

      led.write(0, (err) => {
        if (err) {
          return cb(err);
        }

        loop(count - 1);
      });
    });
  };

  loop(pulseCount);
};

const asyncWritesPerSecond = (cb) => {
  const led = new Gpio(17, 'out');
  let writes = 0;

  const loop = (count) => {
    if (count === 0) {
      led.unexport();
      return cb(null, writes / 10);
    }

    pulseLed(led, 10000, (err, writesPerSecond) => {
      if (err) {
        return cb(err);
      }

      writes += writesPerSecond;

      loop(count - 1);
    });
  };

  // Do a dry run first to get the runtime primed
  pulseLed(led, 5000, (err, writesPerSecond) => {
    if (err) {
      return cb(err);
    }
    loop(10);
  });
};

asyncWritesPerSecond((err, averageWritesPerSecond) => {
  if (err) {
    throw err;
  }

  console.log('ok - ' + __filename);
  console.log(
    '     ' + Math.floor(averageWritesPerSecond) + ' async writes per second'
  );
});

