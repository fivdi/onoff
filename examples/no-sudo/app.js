var Gpio = require('../../onoff').Gpio,
    led = new Gpio(/* 38 */ 17, 'out'),
    time = process.hrtime(),
    herz,
    i;

for (i = 0; i !== 50000; i += 1) {
    led.writeSync(1);
    led.writeSync(0);
}

time = process.hrtime(time);
herz = Math.floor(i / (time[0] + time[1] / 1E9));

console.log('Frequency = ' + herz / 1000 + 'KHz');

