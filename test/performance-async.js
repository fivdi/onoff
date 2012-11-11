var Gpio = require('../onoff').Gpio,
    ledGpio = new Gpio(/* 38 */ 17, 'out'),
    time = process.hrtime(),
    herz,
    i = 0;

function test() {
    ledGpio.write(1, function(err) {
        if (err) throw err;

        ledGpio.write(0, function(err) {
            if (err) throw err;

            i += 1;

            if (i != 4000) {
                test();
            } else {
                time = process.hrtime(time);
                herz = Math.floor(i / (time[0] + time[1] / 1E9));

                console.log('Frequency = ' + herz / 1000 + 'KHz');

                ledGpio.unexport();
            }
        });
    });
}

test();

