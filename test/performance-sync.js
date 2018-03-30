"use strict";

const Gpio = require('../onoff').Gpio;
const led = new Gpio(17, 'out');
let time = process.hrtime();
let i;

for (i = 0; i !== 50000; i += 1) {
  led.writeSync(1);
  led.writeSync(0);
}

time = process.hrtime(time);
const hertz = Math.floor(i / (time[0] + time[1] / 1E9));

led.unexport();

console.log('ok - ' + __filename);
console.log('     sync frequency = ' + hertz / 1000 + 'KHz');

