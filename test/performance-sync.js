"use strict";

const Gpio = require('../onoff').Gpio;

const pulseLed = (led, pulseCount) => {
  let time = process.hrtime();

  for (let i = 0; i !== pulseCount; i += 1) {
    led.writeSync(1);
    led.writeSync(0);
  }

  time = process.hrtime(time);

  const writesPerSecond = pulseCount * 2 / (time[0] + time[1] / 1E9);

  return writesPerSecond;
}

const syncWritesPerSecond = () => {
  const led = new Gpio(17, 'out');
  let writes = 0;

  // Do a dry run first to get the runtime primed
  pulseLed(led, 50000);

  for (let i = 0; i !== 10; i += 1) {
    writes += pulseLed(led, 100000);
  }

  led.unexport();

  return writes / 10;
}

console.log('ok - ' + __filename);
console.log(
  '     ' + Math.floor(syncWritesPerSecond()) + ' sync writes per second'
);

